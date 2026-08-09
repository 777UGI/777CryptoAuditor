import { BalanceResult } from "@/lib/web3/balance";
import { networks } from "@/lib/web3/networks";
import { Wallet, AlertCircle } from "lucide-react";
import { CryptoLogo } from "./CryptoLogo";

interface Props {
  results: BalanceResult[];
  walletAddress: string;
}

export default function BalanceResultDisplay({ results, walletAddress }: Props) {
  return (
    <div className="bg-card border border-card-border rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/20 p-3 rounded-full text-primary">
          <Wallet size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Wallet Balances</h3>
          <p className="text-sm font-mono text-foreground/60 break-all">{walletAddress}</p>
        </div>
      </div>

      <div className="space-y-4">
        {results.map((result, idx) => {
          const network = networks.find(n => n.id === result.networkId);
          if (!network) return null;

          if (result.error) {
            return (
              <div key={idx} className="p-4 rounded-xl border border-error/50 bg-error/10">
                <div className="flex items-center gap-2 text-error font-medium mb-1">
                  <AlertCircle size={16} />
                  {network.name}
                </div>
                <p className="text-sm text-error/80">{result.error}</p>
              </div>
            );
          }

          return (
            <div key={idx} className="p-4 rounded-xl border border-card-border bg-background/50 hover:border-primary/50 transition-colors">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <CryptoLogo symbol={network.nativeCurrency.symbol} size={20} />
                {network.name}
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background p-3 rounded-lg border border-card-border">
                  <p className="text-xs text-foreground/60 mb-1 font-medium flex items-center gap-1.5">
                    <CryptoLogo symbol={network.nativeCurrency.symbol} size={14} /> {network.nativeCurrency.symbol} Balance
                  </p>
                  <p className="text-lg font-bold font-mono text-foreground truncate" title={result.nativeBalance}>
                    {Number(result.nativeBalance).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                  </p>
                </div>
                
                <div className="bg-background p-3 rounded-lg border border-card-border">
                  <p className="text-xs text-foreground/60 mb-1 font-medium flex items-center gap-1.5">
                    <CryptoLogo symbol="USDT" size={14} /> USDT Balance
                  </p>
                  <p className="text-lg font-bold font-mono text-foreground truncate" title={result.usdtBalance}>
                    {Number(result.usdtBalance).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {results.length === 0 && (
          <div className="p-8 text-center text-foreground/50">
            No balances found.
          </div>
        )}
      </div>
    </div>
  );
}
