"use client";

import { useState, useEffect } from "react";
import { networks } from "@/lib/web3/networks";
import { Search, Loader2, Save, Settings, ChevronDown, ChevronUp, Wallet } from "lucide-react";
import { CryptoLogo } from "./CryptoLogo";

interface Props {
  onVerify: (checks: { networkId: string, walletAddress: string }[], txHash: string) => void;
  onCheckBalance: (networkIds: string[], walletAddress: string) => void;
  isLoading: boolean;
}

export default function TransactionForm({ onVerify, onCheckBalance, isLoading }: Props) {
  const [activeTab, setActiveTab] = useState<"transaction" | "balance">("transaction");
  const [txHash, setTxHash] = useState("");
  const [balanceAddress, setBalanceAddress] = useState("");
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  // Global wallet addresses
  const [ethAddress, setEthAddress] = useState("");
  const [bscAddress, setBscAddress] = useState("");
  const [solAddress, setSolAddress] = useState("");
  const [trxAddress, setTrxAddress] = useState("");

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser") || "Admin777";
    
    const savedEth = localStorage.getItem(`ethAddress_${currentUser}`) || "";
    const savedBsc = localStorage.getItem(`bscAddress_${currentUser}`) || "";
    const savedSol = localStorage.getItem(`solAddress_${currentUser}`) || "";
    const savedTrx = localStorage.getItem(`trxAddress_${currentUser}`) || "";
    
    setEthAddress(savedEth);
    setBscAddress(savedBsc);
    setSolAddress(savedSol);
    setTrxAddress(savedTrx);
    
    if (!savedEth && !savedBsc && !savedSol && !savedTrx) {
      setShowSettings(true);
    }
  }, []);

  const handleSaveSettings = () => {
    const currentUser = localStorage.getItem("currentUser") || "Admin777";
    localStorage.setItem(`ethAddress_${currentUser}`, ethAddress);
    localStorage.setItem(`bscAddress_${currentUser}`, bscAddress);
    localStorage.setItem(`solAddress_${currentUser}`, solAddress);
    localStorage.setItem(`trxAddress_${currentUser}`, trxAddress);
    setShowSettings(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (activeTab === "balance") {
      const hash = balanceAddress.trim();
      if (!hash) {
        setError("Please enter a wallet address.");
        return;
      }
      
      if (hash.startsWith("0x") && hash.length === 42) {
        onCheckBalance(["ethereum", "bsc"], hash);
      } else if (hash.startsWith("T") && hash.length === 34) {
        onCheckBalance(["tron"], hash);
      } else if (hash.length >= 32 && hash.length <= 44 && !hash.startsWith("0x")) {
        onCheckBalance(["solana"], hash);
      } else {
        setError("Could not identify network from wallet address format.");
      }
      return;
    }

    const hash = txHash.trim();
    if (!hash) {
      setError("Please enter a transaction hash.");
      return;
    }

    const checks: { networkId: string, walletAddress: string }[] = [];

    // Auto-detect based on hash format
    if (hash.startsWith("0x") && hash.length === 66) {
      // EVM Hash - try ETH and BSC
      if (ethAddress) checks.push({ networkId: "ethereum", walletAddress: ethAddress });
      if (bscAddress) checks.push({ networkId: "bsc", walletAddress: bscAddress });
      
      if (checks.length === 0) {
        setError("Please configure an Ethereum or BSC wallet address in settings.");
        setShowSettings(true);
        return;
      }
    } else if (hash.length === 64 && !hash.startsWith("0x")) {
      // Tron Hash
      if (!trxAddress) {
        setError("Please configure a Tron wallet address in settings.");
        setShowSettings(true);
        return;
      }
      checks.push({ networkId: "tron", walletAddress: trxAddress });
    } else if (hash.length >= 80 && hash.length <= 90 && !hash.includes("O") && !hash.includes("I") && !hash.includes("l") && !hash.includes("0")) {
      // Solana Hash (Base58 heuristic)
      if (!solAddress) {
        setError("Please configure a Solana wallet address in settings.");
        setShowSettings(true);
        return;
      }
      checks.push({ networkId: "solana", walletAddress: solAddress });
    } else {
      // If we can't be sure, we'll try everything that has an address configured
      if (ethAddress && hash.startsWith("0x")) checks.push({ networkId: "ethereum", walletAddress: ethAddress });
      if (bscAddress && hash.startsWith("0x")) checks.push({ networkId: "bsc", walletAddress: bscAddress });
      if (trxAddress && hash.length === 64) checks.push({ networkId: "tron", walletAddress: trxAddress });
      if (solAddress) checks.push({ networkId: "solana", walletAddress: solAddress });
      
      if (checks.length === 0) {
        setError("Invalid format or no wallets configured.");
        return;
      }
    }

    onVerify(checks, hash);
  };

  return (
    <div className="bg-card border border-card-border rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
      
      {/* Tabs */}
      <div className="flex bg-background/50 p-1.5 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab("transaction")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            activeTab === "transaction" 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-foreground/60 hover:text-foreground hover:bg-background/50"
          }`}
        >
          Verify Transaction
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("balance")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            activeTab === "balance" 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-foreground/60 hover:text-foreground hover:bg-background/50"
          }`}
        >
          Check Wallet Balance
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="inputValue" className="block text-sm font-medium text-foreground/80 mb-2">
            {activeTab === "transaction" ? "Transaction Hash" : "Wallet Address"}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40">
              {activeTab === "transaction" ? <Search size={18} /> : <Wallet size={18} />}
            </div>
            <input
              id="inputValue"
              type="text"
              placeholder={activeTab === "transaction" ? "Paste TxHash..." : "Paste Wallet Address..."}
              value={activeTab === "transaction" ? txHash : balanceAddress}
              onChange={(e) => activeTab === "transaction" ? setTxHash(e.target.value) : setBalanceAddress(e.target.value)}
              className="w-full bg-background border border-card-border rounded-xl pl-11 pr-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-foreground/30 font-mono text-sm shadow-inner"
              disabled={isLoading}
              required
            />
          </div>
        </div>

        {error && (
          <p className="text-error text-sm animate-in fade-in">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
        >
          {isLoading ? (
            <>
              <Loader2 size={24} className="animate-spin" />
              {activeTab === "transaction" ? "Scanning..." : "Checking..."}
            </>
          ) : (
            <>
              {activeTab === "transaction" ? "Verify Transaction" : "Check Balance"}
            </>
          )}
        </button>
      </form>

      {/* Global Wallet Settings Accordion (Moved to bottom) */}
      <div className="border border-card-border rounded-xl overflow-hidden bg-background/50 mt-8">
        <button 
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className="w-full px-5 py-4 flex items-center justify-between text-sm font-medium hover:bg-background transition-colors"
        >
          <div className="flex items-center gap-2 text-foreground/80">
            <Settings size={18} className="text-primary" />
            Global Wallet Configuration
          </div>
          {showSettings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        {showSettings && (
          <div className="p-5 border-t border-card-border space-y-4 animate-in slide-in-from-top-2">
            <p className="text-xs text-foreground/60 mb-4">
              Configure your wallet addresses once. The app will automatically detect the correct network and wallet when you paste a transaction hash.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-foreground/70 mb-1">
                  <CryptoLogo symbol="ETH" size={16} /> Ethereum Address
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={ethAddress}
                  onChange={(e) => setEthAddress(e.target.value)}
                  className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-foreground/70 mb-1">
                  <CryptoLogo symbol="BNB" size={16} /> BSC Address
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={bscAddress}
                  onChange={(e) => setBscAddress(e.target.value)}
                  className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-foreground/70 mb-1">
                  <CryptoLogo symbol="SOL" size={16} /> Solana Address
                </label>
                <input
                  type="text"
                  placeholder="Base58..."
                  value={solAddress}
                  onChange={(e) => setSolAddress(e.target.value)}
                  className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-foreground/70 mb-1">
                  <CryptoLogo symbol="TRX" size={16} /> Tron Address
                </label>
                <input
                  type="text"
                  placeholder="T..."
                  value={trxAddress}
                  onChange={(e) => setTrxAddress(e.target.value)}
                  className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>
            </div>
            
            <button
              onClick={handleSaveSettings}
              className="mt-4 w-full bg-primary/20 hover:bg-primary/30 text-primary font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Save size={16} />
              Save Addresses
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
