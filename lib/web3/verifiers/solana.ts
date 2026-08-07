import { Connection, PublicKey, ParsedTransactionWithMeta, ParsedInstruction } from "@solana/web3.js";
import { Network } from "../networks";
import { VerificationResult, TransactionType, TransactionStatus } from "../verifier";

export async function verifySolanaTransaction(
  network: Network,
  walletAddress: string,
  txHash: string
): Promise<VerificationResult> {
  const connection = new Connection(network.rpcUrl);
  
  try {
    const pubKey = new PublicKey(walletAddress);
    
    // 1. Fetch Balances
    const nativeBalPromise = connection.getBalance(pubKey);
    const usdtMint = new PublicKey(network.usdtAddress);
    
    const usdtTokenAccountsPromise = connection.getParsedTokenAccountsByOwner(pubKey, {
      mint: usdtMint
    });

    const [nativeBal, tokenAccounts, tx] = await Promise.all([
      nativeBalPromise,
      usdtTokenAccountsPromise,
      connection.getParsedTransaction(txHash, { maxSupportedTransactionVersion: 0 })
    ]);

    const walletNativeBalance = (nativeBal / 1e9).toString();
    
    let walletUsdtBalance = "0";
    if (tokenAccounts.value.length > 0) {
       walletUsdtBalance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmountString;
    }

    if (!tx || !tx.meta) {
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

    if (tx.meta.err) {
      return {
        status: "FAILED",
        type: "UNRELATED",
        amount: "0",
        symbol: network.nativeCurrency.symbol,
        from: "",
        to: "",
        blockNumber: tx.slot,
        fee: (tx.meta.fee / 1e9).toString(),
        walletNativeBalance,
        walletUsdtBalance,
        error: "Transaction failed on chain",
      };
    }

    // Determine sender / receiver
    let txType: TransactionType = "UNRELATED";
    let status: TransactionStatus = "INVALID";
    let amount = "0";
    let symbol = network.nativeCurrency.symbol;
    let from = "";
    let to = "";

    // Simple SOL transfer detection
    if (tx.transaction.message.instructions.length > 0) {
      for (const ix of tx.transaction.message.instructions) {
        if ('parsed' in ix && ix.program === "system" && ix.parsed.type === "transfer") {
          const info = ix.parsed.info;
          from = info.source;
          to = info.destination;
          const amt = info.lamports / 1e9;
          
          if (from === walletAddress) {
            txType = "SENT";
            amount = amt.toString();
          } else if (to === walletAddress) {
            txType = "RECEIVED";
            amount = amt.toString();
          }
        }
      }
    }

    // Check for SPL Token (USDT) transfers via pre/post balances
    if (tx.meta.preTokenBalances && tx.meta.postTokenBalances) {
      for (const post of tx.meta.postTokenBalances) {
        if (post.mint === network.usdtAddress && post.owner === walletAddress) {
          const pre = tx.meta.preTokenBalances.find(p => p.accountIndex === post.accountIndex);
          const postAmt = post.uiTokenAmount.uiAmount || 0;
          const preAmt = pre?.uiTokenAmount.uiAmount || 0;
          const diff = postAmt - preAmt;
          
          if (Math.abs(diff) > 0) {
            symbol = "USDT";
            amount = Math.abs(diff).toString();
            if (diff > 0) {
               txType = "RECEIVED";
               to = walletAddress;
            } else {
               txType = "SENT";
               from = walletAddress;
            }
          }
        }
      }
    }

    if (txType !== "UNRELATED") {
      status = "VALID";
    }

    const fee = (tx.meta.fee / 1e9).toString();

    return {
      status,
      type: txType,
      amount,
      symbol,
      from,
      to,
      blockNumber: tx.slot,
      fee,
      walletNativeBalance,
      walletUsdtBalance,
      error: status === "INVALID" ? "Transaction is VALID on chain, but NOT associated with this wallet address" : undefined
    };

  } catch (error: any) {
    console.error("Solana Verification Error:", error);
    throw new Error(error.message || "Failed to fetch transaction details");
  }
}
