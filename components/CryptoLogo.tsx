import React from "react";

interface CryptoLogoProps {
  symbol: string;
  size?: number;
  className?: string;
}

export function CryptoLogo({ symbol, size = 24, className = "" }: CryptoLogoProps) {
  const s = symbol.toUpperCase();

  const getLogoUrl = () => {
    switch (s) {
      case "ETH":
      case "ETHEREUM":
        return "https://cryptologos.cc/logos/ethereum-eth-logo.svg";
      case "BNB":
      case "BSC":
        return "https://cryptologos.cc/logos/bnb-bnb-logo.svg";
      case "SOL":
      case "SOLANA":
        return "https://cryptologos.cc/logos/solana-sol-logo.svg";
      case "TRX":
      case "TRON":
        return "https://cryptologos.cc/logos/tron-trx-logo.svg";
      case "USDT":
        return "https://cryptologos.cc/logos/tether-usdt-logo.svg";
      default:
        return null;
    }
  };

  const url = getLogoUrl();

  if (url) {
    return (
      <img 
        src={url} 
        alt={`${symbol} logo`} 
        width={size} 
        height={size} 
        className={className} 
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
    );
  }

  // Generic coin icon fallback
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="16" cy="16" r="16" fill="#888888" />
      <circle cx="16" cy="16" r="11" fill="none" stroke="white" strokeWidth="2" />
      <text x="16" y="20" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">?</text>
    </svg>
  );
}
