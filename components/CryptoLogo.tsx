import React from "react";

interface CryptoLogoProps {
  symbol: string;
  size?: number;
  className?: string;
}

export function CryptoLogo({ symbol, size = 24, className = "" }: CryptoLogoProps) {
  const s = symbol.toUpperCase();

  const getLogo = () => {
    switch (s) {
      case "ETH":
      case "ETHEREUM":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
            <circle cx="16" cy="16" r="16" fill="#627EEA" />
            <path d="M15.75 4L7 18.25L15.75 23.5L24.5 18.25L15.75 4Z" fill="white" fillOpacity="0.601" />
            <path d="M15.75 4L7 18.25L15.75 14L24.5 18.25L15.75 4Z" fill="white" />
            <path d="M15.75 24.75L7 19.5L15.75 28L24.5 19.5L15.75 24.75Z" fill="white" fillOpacity="0.601" />
          </svg>
        );
      case "BNB":
      case "BSC":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
            <circle cx="16" cy="16" r="16" fill="#F3BA2F" />
            <path d="M12.115 14.545L16 10.66L19.885 14.545L22.952 11.478L16 4.526L9.048 11.478L12.115 14.545ZM16 16.924L12.56 13.484L9.493 16.551L16 23.058L22.507 16.551L19.44 13.484L16 16.924ZM20.897 18.16L23.964 21.227L27.473 17.718L23.964 14.209L20.897 17.276L19.549 18.624L20.897 18.16ZM11.103 18.16L8.036 21.227L4.527 17.718L8.036 14.209L11.103 17.276L12.451 18.624L11.103 18.16Z" fill="white" />
          </svg>
        );
      case "SOL":
      case "SOLANA":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
            <circle cx="16" cy="16" r="16" fill="#000000" />
            <path d="M7.34 22.06L9.34 20.06H25.33L23.33 22.06H7.34ZM7.34 14.07L9.34 12.07H25.33L23.33 14.07H7.34ZM23.33 18.06L25.33 16.06H9.34L7.34 18.06H23.33Z" fill="#14F195" />
            <path d="M23.33 18.06L25.33 16.06H9.34L7.34 18.06H23.33Z" fill="#9945FF" />
          </svg>
        );
      case "TRX":
      case "TRON":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
            <circle cx="16" cy="16" r="16" fill="#FF060A" />
            <path d="M12.435 8.7L6 17.653L16.275 25.109L26 14.618L12.435 8.7ZM11.666 10.978L13.886 16.828L8.536 17.067L11.666 10.978ZM14.938 17.308L12.569 11.082L22.25 15.342L14.938 17.308ZM9.006 18.093L15.373 18.423L15.867 22.567L9.006 18.093ZM16.634 22.378L15.932 17.917L23.23 15.952L16.634 22.378Z" fill="white" />
          </svg>
        );
      case "USDT":
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
            <circle cx="16" cy="16" r="16" fill="#26A17B" />
            <path d="M17.848 15.656V18.172C20.655 17.94 22.5 17.03 22.5 15.928C22.5 14.825 20.655 13.916 17.848 13.684V11H23.5V8.5H8.5V11H14.152V13.684C11.345 13.916 9.5 14.825 9.5 15.928C9.5 17.03 11.345 17.94 14.152 18.172V23.5H17.848V15.656ZM16 16.733C13.619 16.733 11.696 16.353 11.696 15.884C11.696 15.415 13.619 15.035 16 15.035C18.381 15.035 20.304 15.415 20.304 15.884C20.304 16.353 18.381 16.733 16 16.733Z" fill="white" />
          </svg>
        );
      default:
        // Generic coin icon
        return (
          <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
            <circle cx="16" cy="16" r="16" fill="#888888" />
            <circle cx="16" cy="16" r="11" fill="none" stroke="white" strokeWidth="2" />
            <text x="16" y="20" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">?</text>
          </svg>
        );
    }
  };

  return getLogo();
}
