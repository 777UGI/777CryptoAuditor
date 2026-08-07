import { TronWeb } from "tronweb";
import { Network } from "../networks";
import { VerificationResult, TransactionType, TransactionStatus } from "../verifier";

export async function verifyTronTransaction(
  network: Network,
  walletAddress: string,
  txHash: string
): Promise<VerificationResult> {
  // We can use a public full node
  const tronWeb = new TronWeb({
    fullNode: network.rpcUrl,
    solidityNode: network.rpcUrl,
    eventServer: network.rpcUrl
  });

  try {
    // 1. Fetch Balances
    const nativeBalPromise = tronWeb.trx.getBalance(walletAddress).catch(() => 0);
    // USDT is a TRC20 token on Tron
    // We can query the balance using tronWeb.transactionBuilder.triggerSmartContract or just using TronWeb's contract abstraction
    let usdtBalStr = "0";
    try {
        tronWeb.setAddress(walletAddress);
        const contract = await tronWeb.contract().at(network.usdtAddress);
        const usdtBal = await contract.balanceOf(walletAddress).call();
        // USDT on Tron has 6 decimals
        usdtBalStr = (parseInt(usdtBal.toString()) / 1e6).toString();
    } catch (e) {
        console.error("Failed to fetch TRON USDT balance", e);
    }

    const [nativeBal, tx, info] = await Promise.all([
      nativeBalPromise,
      tronWeb.trx.getTransaction(txHash).catch(() => null),
      tronWeb.trx.getTransactionInfo(txHash).catch(() => null)
    ]);

    const walletNativeBalance = (nativeBal / 1e6).toString();
    const walletUsdtBalance = usdtBalStr;

    if (!tx || !info) {
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

    // Checking status
    // In Tron, info.receipt.result indicates success (e.g. "SUCCESS")
    if (info.receipt && info.receipt.result !== "SUCCESS" && info.receipt.result) {
        return {
          status: "FAILED",
          type: "UNRELATED",
          amount: "0",
          symbol: network.nativeCurrency.symbol,
          from: "",
          to: "",
          blockNumber: info.blockNumber || 0,
          fee: ((info.fee || 0) / 1e6).toString(),
          walletNativeBalance,
          walletUsdtBalance,
          error: "Transaction failed on chain",
        };
    }

    let txType: TransactionType = "UNRELATED";
    let status: TransactionStatus = "INVALID";
    let amount = "0";
    let symbol = network.nativeCurrency.symbol;
    let from = "";
    let to = "";

    // Parse transaction contracts
    if (tx.raw_data && tx.raw_data.contract && tx.raw_data.contract.length > 0) {
        const contractInfo = tx.raw_data.contract[0];
        const val = contractInfo.parameter.value as any;
        
        if (contractInfo.type === "TransferContract") {
            from = tronWeb.address.fromHex(val.owner_address);
            to = tronWeb.address.fromHex(val.to_address);
            amount = (val.amount / 1e6).toString();
        } 
        else if (contractInfo.type === "TriggerSmartContract") {
            from = tronWeb.address.fromHex(val.owner_address);
            const contractAddress = tronWeb.address.fromHex(val.contract_address);
            
            if (contractAddress === network.usdtAddress) {
                symbol = "USDT";
                // We need to parse TRC20 transfer from data
                // Data format: transfer(address,uint256)
                // 4 bytes sig + 32 bytes address + 32 bytes amount
                const data = val.data;
                if (data && data.startsWith("a9059cbb")) { // transfer sig
                    const toHex = "41" + data.substring(8, 72).replace(/^0+/, '').padStart(40, '0');
                    try {
                        to = tronWeb.address.fromHex(toHex);
                    } catch (e) {
                        // fallback
                        to = "Unknown";
                    }
                    const amountHex = data.substring(72);
                    const amountInt = parseInt(amountHex, 16);
                    amount = (amountInt / 1e6).toString(); // USDT 6 decimals
                }
            }
        }
    }

    if (from === walletAddress) {
        txType = "SENT";
    } else if (to === walletAddress) {
        txType = "RECEIVED";
    }

    if (txType !== "UNRELATED") {
      status = "VALID";
    }

    return {
      status,
      type: txType,
      amount,
      symbol,
      from,
      to,
      blockNumber: info.blockNumber || 0,
      fee: ((info.fee || 0) / 1e6).toString(),
      walletNativeBalance,
      walletUsdtBalance,
      error: status === "INVALID" ? "Transaction is VALID on chain, but NOT associated with this wallet address" : undefined
    };

  } catch (error: any) {
    console.error("Tron Verification Error:", error);
    throw new Error(error.message || "Failed to fetch transaction details");
  }
}
