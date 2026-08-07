import { VerificationResult } from "@/lib/web3/verifier";
import { networks } from "@/lib/web3/networks";
import { CheckCircle2, XCircle, AlertTriangle, ArrowRightLeft, ArrowDownToLine, ArrowUpFromLine, ExternalLink } from "lucide-react";

interface Props {
  result: VerificationResult;
  networkId: string;
}

export default function TransactionResult({ result, networkId }: Props) {
  const network = networks.find((n) => n.id === networkId);
  const explorerUrl = network?.explorerUrl || "";

  const renderBadge = () => {
    switch (result.status) {
      case "VALID":
        return (
          <div className="flex items-center gap-2 bg-success/20 text-success px-4 py-2 rounded-full border border-success/30 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <CheckCircle2 size={20} />
            <span>VALID & VERIFIED</span>
          </div>
        );
      case "INVALID":
        return (
          <div className="flex items-center gap-2 bg-error/20 text-error px-4 py-2 rounded-full border border-error/30 font-semibold shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <XCircle size={20} />
            <span>INVALID / NOT MATCHED</span>
          </div>
        );
      case "FAILED":
        return (
          <div className="flex items-center gap-2 bg-warning/20 text-warning px-4 py-2 rounded-full border border-warning/30 font-semibold shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            <AlertTriangle size={20} />
            <span>FAILED ON CHAIN</span>
          </div>
        );
      case "NOT_FOUND":
      default:
        return (
          <div className="flex items-center gap-2 bg-foreground/10 text-foreground px-4 py-2 rounded-full border border-foreground/20 font-semibold">
            <XCircle size={20} />
            <span>TRANSACTION NOT FOUND</span>
          </div>
        );
    }
  };

  const renderTypeIcon = () => {
    switch (result.type) {
      case "RECEIVED": return <ArrowDownToLine className="text-success" size={24} />;
      case "SENT": return <ArrowUpFromLine className="text-error" size={24} />;
      default: return <ArrowRightLeft className="text-foreground/50" size={24} />;
    }
  };

  const typeColor = result.type === "RECEIVED" ? "text-success" : result.type === "SENT" ? "text-error" : "text-foreground/50";

  return (
    <div className="bg-card border border-card-border rounded-2xl p-6 shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-semibold text-foreground">Verification Report</h3>
        {renderBadge()}
      </div>

      {result.error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm flex items-start gap-3">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <p>{result.error}</p>
        </div>
      )}

      {/* Wallet Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 overflow-hidden">
          <p className="text-xs text-primary/80 mb-1 uppercase tracking-wider font-semibold truncate">Wallet {network?.nativeCurrency.symbol} Balance</p>
          <p className="text-xl font-bold text-foreground break-all">
            {result.walletNativeBalance || "0"} <span className="text-primary text-sm whitespace-nowrap">{network?.nativeCurrency.symbol}</span>
          </p>
        </div>
        <div className="bg-success/10 p-4 rounded-xl border border-success/20 overflow-hidden">
          <p className="text-xs text-success/80 mb-1 uppercase tracking-wider font-semibold truncate">Wallet USDT Balance</p>
          <p className="text-xl font-bold text-foreground break-all">
            {result.walletUsdtBalance || "0"} <span className="text-success text-sm whitespace-nowrap">USDT</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-background/50 p-4 rounded-xl border border-card-border/50">
          <p className="text-xs text-foreground/50 mb-1 uppercase tracking-wider font-semibold">Transaction Type</p>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-background ${typeColor} bg-opacity-10 border border-current`}>
              {renderTypeIcon()}
            </div>
            <span className={`font-medium ${typeColor}`}>
              {result.type === "RECEIVED" ? "Received Asset" : result.type === "SENT" ? "Sent Asset" : "Unrelated / Contract Interaction"}
            </span>
          </div>
        </div>

        <div className="bg-background/50 p-4 rounded-xl border border-card-border/50">
          <p className="text-xs text-foreground/50 mb-1 uppercase tracking-wider font-semibold">Amount Transferred</p>
          <p className="text-2xl font-bold text-foreground">
            {result.amount} <span className="text-primary text-lg">{result.symbol}</span>
          </p>
        </div>

        <div className="bg-background/50 p-4 rounded-xl border border-card-border/50 col-span-1 md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-foreground/50 mb-1 uppercase tracking-wider font-semibold">From Address</p>
              {result.from ? (
                <a href={`${explorerUrl}/address/${result.from}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline font-mono text-sm break-all">
                  {result.from}
                  <ExternalLink size={14} />
                </a>
              ) : (
                <span className="text-sm text-foreground/40">N/A</span>
              )}
            </div>
            <div>
              <p className="text-xs text-foreground/50 mb-1 uppercase tracking-wider font-semibold">To Address</p>
              {result.to ? (
                <a href={`${explorerUrl}/address/${result.to}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline font-mono text-sm break-all">
                  {result.to}
                  <ExternalLink size={14} />
                </a>
              ) : (
                <span className="text-sm text-foreground/40">N/A</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-background/50 p-4 rounded-xl border border-card-border/50">
          <p className="text-xs text-foreground/50 mb-1 uppercase tracking-wider font-semibold">Block Number</p>
          <p className="font-mono text-sm">{result.blockNumber || "N/A"}</p>
        </div>
        
        <div className="bg-background/50 p-4 rounded-xl border border-card-border/50">
          <p className="text-xs text-foreground/50 mb-1 uppercase tracking-wider font-semibold">Transaction Fee</p>
          <p className="font-mono text-sm">{result.fee} {network?.nativeCurrency.symbol}</p>
        </div>
      </div>
    </div>
  );
}
