"use client";

import { useState } from "react";
import TransactionForm from "@/components/TransactionForm";
import TransactionResult from "@/components/TransactionResult";
import BalanceResultDisplay from "@/components/BalanceResult";
import { verifyTransaction, VerificationResult } from "@/lib/web3/verifier";
import { getWalletBalances, BalanceResult } from "@/lib/web3/balance";

export default function Home() {
  const [txResult, setTxResult] = useState<VerificationResult | null>(null);
  const [networkId, setNetworkId] = useState<string>("");
  
  const [balanceResults, setBalanceResults] = useState<BalanceResult[]>([]);
  const [checkedAddress, setCheckedAddress] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (checks: { networkId: string, walletAddress: string }[], txHash: string) => {
    setIsLoading(true);
    setTxResult(null);
    setBalanceResults([]);
    setNetworkId("");
    
    let lastError: any = null;
    let foundResult: VerificationResult | null = null;
    let successfulNetworkId = "";

    for (const check of checks) {
      try {
        const verificationResult = await verifyTransaction(check.networkId, check.walletAddress, txHash);
        if (verificationResult.status !== "NOT_FOUND") {
          foundResult = verificationResult;
          successfulNetworkId = check.networkId;
          break;
        }
      } catch (error: any) {
        lastError = error;
        // Continue checking other networks even if one throws
      }
    }

    if (foundResult) {
      setTxResult(foundResult);
      setNetworkId(successfulNetworkId);
    } else {
      setTxResult({
        status: "NOT_FOUND",
        type: "UNRELATED",
        amount: "0",
        symbol: "",
        from: "",
        to: "",
        blockNumber: 0,
        fee: "0",
        error: lastError?.message || "Transaction not found on the detected networks.",
      });
      setNetworkId(checks[0]?.networkId || "");
    }
    
    setIsLoading(false);
  };

  const handleCheckBalance = async (networkIds: string[], walletAddress: string) => {
    setIsLoading(true);
    setTxResult(null);
    setBalanceResults([]);
    setCheckedAddress(walletAddress);

    const promises = networkIds.map(id => getWalletBalances(id, walletAddress));
    const results = await Promise.all(promises);
    
    setBalanceResults(results);
    setIsLoading(false);
  };

  const hasResult = txResult || balanceResults.length > 0;

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-12">
        
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Audit Transactions with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-success">Confidence</span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Instantly verify whether a blockchain transaction is genuinely associated with your wallet, or easily check any wallet's balances across multiple chains.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          <div className={`${hasResult ? 'lg:col-span-5' : 'lg:col-span-8 lg:col-start-3'} w-full transition-all duration-500`}>
            <TransactionForm 
              onVerify={handleVerify} 
              onCheckBalance={handleCheckBalance}
              isLoading={isLoading} 
            />
          </div>
          
          {hasResult && (
            <div className="lg:col-span-7 w-full h-full animate-in fade-in zoom-in-95 duration-500">
              {txResult && (
                <TransactionResult result={txResult} networkId={networkId} />
              )}
              {balanceResults.length > 0 && (
                <BalanceResultDisplay results={balanceResults} walletAddress={checkedAddress} />
              )}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
