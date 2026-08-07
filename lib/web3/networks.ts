export type NetworkFamily = "EVM" | "SOLANA" | "TRON";

export type Network = {
  id: string;
  name: string;
  family: NetworkFamily;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  usdtAddress: string;
};

export const networks: Network[] = [
  {
    id: "ethereum",
    name: "Ethereum Mainnet",
    family: "EVM",
    rpcUrl: "https://ethereum-rpc.publicnode.com",
    explorerUrl: "https://etherscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    usdtAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  },
  {
    id: "bsc",
    name: "BNB Smart Chain",
    family: "EVM",
    rpcUrl: "https://bsc-dataseed.binance.org/",
    explorerUrl: "https://bscscan.com",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    usdtAddress: "0x55d398326f99059fF775485246999027B3197955",
  },
  {
    id: "solana",
    name: "Solana Mainnet",
    family: "SOLANA",
    rpcUrl: "https://api.mainnet-beta.solana.com",
    explorerUrl: "https://solscan.io",
    nativeCurrency: { name: "Solana", symbol: "SOL", decimals: 9 },
    usdtAddress: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  },
  {
    id: "tron",
    name: "Tron Mainnet",
    family: "TRON",
    rpcUrl: "https://api.trongrid.io",
    explorerUrl: "https://tronscan.org/#",
    nativeCurrency: { name: "Tron", symbol: "TRX", decimals: 6 },
    usdtAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
  },
];

