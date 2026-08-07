import { ethers } from "ethers";
import { Network } from "../networks";
import { VerificationResult, TransactionType, TransactionStatus } from "../verifier";

const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function balanceOf(address owner) view returns (uint256)"
];

export async function verifyEvmTransaction(
  network: Network,
  walletAddress: string,
  txHash: string
): Promise<VerificationResult> {
  const provider = new ethers.JsonRpcProvider(network.rpcUrl);
  const normalizedWallet = walletAddress.toLowerCase();

  try {
    // 1. Fetch Balances
    const nativeBalancePromise = provider.getBalance(walletAddress);
    const usdtContract = new ethers.Contract(network.usdtAddress, ERC20_ABI, provider);
    const usdtBalancePromise = usdtContract.balanceOf(walletAddress).catch(() => BigInt(0));

    const [nativeBal, usdtBal, tx, receipt] = await Promise.all([
      nativeBalancePromise,
      usdtBalancePromise,
      provider.getTransaction(txHash),
      provider.getTransactionReceipt(txHash),
    ]);

    const walletNativeBalance = ethers.formatEther(nativeBal);
    // USDT on ETH/BNB typically uses 6 or 18 decimals, standard USDT is 6 on ETH, 18 on BSC.
    // For simplicity we will use 6 for ETH and 18 for BSC, or just try to format according to known
    const usdtDecimals = network.id === "ethereum" ? 6 : 18;
    const walletUsdtBalance = ethers.formatUnits(usdtBal, usdtDecimals);

    if (!tx || !receipt) {
      return {
        status: "NOT_FOUND",
        type: "UNRELATED",
        amount: "0",
        symbol: "",
        from: "",
        to: "",
        blockNumber: 0,
        fee: "0",
        walletNativeBalance,
        walletUsdtBalance,
        error: "Transaction not found on this network",
      };
    }

    if (receipt.status === 0) {
      return {
        status: "FAILED",
        type: "UNRELATED",
        amount: "0",
        symbol: network.nativeCurrency.symbol,
        from: tx.from || "",
        to: tx.to || "",
        blockNumber: tx.blockNumber || 0,
        fee: ethers.formatEther(receipt.gasUsed * receipt.gasPrice),
        walletNativeBalance,
        walletUsdtBalance,
        error: "Transaction failed on chain",
      };
    }

    const txFrom = tx.from ? tx.from.toLowerCase() : "";
    const txTo = tx.to ? tx.to.toLowerCase() : "";

    let txType: TransactionType = "UNRELATED";
    if (txFrom === normalizedWallet) {
      txType = "SENT";
    } else if (txTo === normalizedWallet) {
      txType = "RECEIVED";
    }

    let status: TransactionStatus = txType !== "UNRELATED" ? "VALID" : "INVALID";

    let amount = "0";
    let symbol = network.nativeCurrency.symbol;

    if (tx.value > BigInt(0)) {
      amount = ethers.formatEther(tx.value);
    } else if (receipt.logs.length > 0) {
      const iface = new ethers.Interface(ERC20_ABI);
      for (const log of receipt.logs) {
        try {
          const parsedLog = iface.parseLog(log);
          if (parsedLog && parsedLog.name === "Transfer") {
            const logFrom = parsedLog.args[0].toLowerCase();
            const logTo = parsedLog.args[1].toLowerCase();
            
            if (logFrom === normalizedWallet || logTo === normalizedWallet) {
               // Check if it's USDT
               const isUsdt = log.address.toLowerCase() === network.usdtAddress.toLowerCase();
               const decimals = isUsdt ? usdtDecimals : 18;
               amount = ethers.formatUnits(parsedLog.args[2], decimals);
               symbol = isUsdt ? "USDT" : "ERC20";
               break; 
            } else if (txType === "UNRELATED") {
               const isUsdt = log.address.toLowerCase() === network.usdtAddress.toLowerCase();
               const decimals = isUsdt ? usdtDecimals : 18;
               amount = ethers.formatUnits(parsedLog.args[2], decimals);
               symbol = isUsdt ? "USDT" : "ERC20";
               break;
            }
          }
        } catch (e) {
          continue;
        }
      }
    }

    const fee = receipt.gasPrice 
      ? ethers.formatEther(receipt.gasUsed * receipt.gasPrice)
      : "0";

    return {
      status,
      type: txType,
      amount,
      symbol,
      from: tx.from || "",
      to: tx.to || "",
      blockNumber: receipt.blockNumber,
      fee,
      walletNativeBalance,
      walletUsdtBalance,
      error: status === "INVALID" ? "Transaction is VALID on chain, but NOT associated with this wallet address" : undefined
    };

  } catch (error: any) {
    console.error("EVM Verification Error:", error);
    throw new Error(error.message || "Failed to fetch transaction details");
  }
}
