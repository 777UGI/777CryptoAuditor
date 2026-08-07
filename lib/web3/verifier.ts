"use server";

import { networks } from "./networks";
import { verifyEvmTransaction } from "./verifiers/evm";
import { verifySolanaTransaction } from "./verifiers/solana";
import { verifyTronTransaction } from "./verifiers/tron";

export type TransactionStatus = "VALID" | "INVALID" | "FAILED" | "NOT_FOUND";
export type TransactionType = "RECEIVED" | "SENT" | "UNRELATED";

export interface VerificationResult {
  status: TransactionStatus;
  type: TransactionType;
  amount: string;
  symbol: string;
  from: string;
  to: string;
  blockNumber: number;
  fee: string;
  walletNativeBalance?: string;
  walletUsdtBalance?: string;
  error?: string;
}

export async function verifyTransaction(
  networkId: string,
  walletAddress: string,
  txHash: string
): Promise<VerificationResult> {
  const network = networks.find((n) => n.id === networkId);
  if (!network) {
    throw new Error("Invalid network selected");
  }

  if (network.family === "EVM") {
    return verifyEvmTransaction(network, walletAddress, txHash);
  } else if (network.family === "SOLANA") {
    return verifySolanaTransaction(network, walletAddress, txHash);
  } else if (network.family === "TRON") {
    return verifyTronTransaction(network, walletAddress, txHash);
  }

  throw new Error("Unsupported network family");
}
