"use server";

import { ethers } from "ethers";
import { Connection, PublicKey } from "@solana/web3.js";
import { TronWeb } from "tronweb";
import { networks } from "./networks";

export interface BalanceResult {
  networkId: string;
  nativeBalance: string;
  usdtBalance: string;
  error?: string;
}

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)"
];

export async function getWalletBalances(networkId: string, walletAddress: string): Promise<BalanceResult> {
  const network = networks.find(n => n.id === networkId);
  if (!network) {
    return { networkId, nativeBalance: "0", usdtBalance: "0", error: "Invalid network" };
  }

  try {
    if (network.family === "EVM") {
      const provider = new ethers.JsonRpcProvider(network.rpcUrl);
      const nativeBalancePromise = provider.getBalance(walletAddress).catch(() => BigInt(0));
      const usdtContract = new ethers.Contract(network.usdtAddress, ERC20_ABI, provider);
      const usdtBalancePromise = usdtContract.balanceOf(walletAddress).catch(() => BigInt(0));

      const [nativeBal, usdtBal] = await Promise.all([nativeBalancePromise, usdtBalancePromise]);
      const usdtDecimals = network.id === "ethereum" ? 6 : 18;

      return {
        networkId,
        nativeBalance: ethers.formatEther(nativeBal),
        usdtBalance: ethers.formatUnits(usdtBal, usdtDecimals)
      };
    } 
    
    else if (network.family === "SOLANA") {
      const connection = new Connection(network.rpcUrl);
      const pubKey = new PublicKey(walletAddress);
      
      const nativeBalPromise = connection.getBalance(pubKey).catch(() => 0);
      const usdtMint = new PublicKey(network.usdtAddress);
      const usdtTokenAccountsPromise = connection.getParsedTokenAccountsByOwner(pubKey, {
        mint: usdtMint
      }).catch(() => ({ value: [] }));

      const [nativeBal, tokenAccounts] = await Promise.all([nativeBalPromise, usdtTokenAccountsPromise]);

      let usdtBal = "0";
      if (tokenAccounts && tokenAccounts.value.length > 0) {
        usdtBal = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmountString;
      }

      return {
        networkId,
        nativeBalance: (nativeBal / 1e9).toString(),
        usdtBalance: usdtBal
      };
    }
    
    else if (network.family === "TRON") {
      const tronWeb = new TronWeb({
        fullNode: network.rpcUrl,
        solidityNode: network.rpcUrl,
        eventServer: network.rpcUrl
      });

      const nativeBalPromise = tronWeb.trx.getBalance(walletAddress).catch(() => 0);
      
      let usdtBalStr = "0";
      try {
          tronWeb.setAddress(walletAddress);
          const contract = await tronWeb.contract().at(network.usdtAddress);
          const usdtBal = await contract.balanceOf(walletAddress).call();
          usdtBalStr = (parseInt(usdtBal.toString()) / 1e6).toString();
      } catch (e) {
          console.error("Failed to fetch TRON USDT balance", e);
      }

      const nativeBal = await nativeBalPromise;

      return {
        networkId,
        nativeBalance: (nativeBal / 1e6).toString(),
        usdtBalance: usdtBalStr
      };
    }

    return { networkId, nativeBalance: "0", usdtBalance: "0", error: "Unsupported network family" };
  } catch (error: any) {
    console.error(`Error fetching balance for ${networkId}:`, error);
    return { networkId, nativeBalance: "0", usdtBalance: "0", error: error.message || "Failed to fetch balances" };
  }
}
