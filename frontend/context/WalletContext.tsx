"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ethers } from "ethers";

interface WalletContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkConnection();
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", () => window.location.reload());

      return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum?.removeListener("chainChanged", () => window.location.reload());
      };
    }
  }, []);

  async function checkConnection() {
    if (typeof window === "undefined" || !window.ethereum) {
      setIsLoading(false);
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_accounts", []);

      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        setAccount(accounts[0]);
        setProvider(provider);
        setSigner(signer);
      }
    } catch (error) {
      console.error("Error checking connection:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function connect() {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask to connect your wallet");
      return;
    }

    try {
      setIsLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        setAccount(accounts[0]);
        setProvider(provider);
        setSigner(signer);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function disconnect() {
    setAccount(null);
    setProvider(null);
    setSigner(null);
  }

  function handleAccountsChanged(accounts: string[]) {
    if (accounts.length === 0) {
      disconnect();
    } else {
      setAccount(accounts[0]);
    }
  }

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        signer,
        connect,
        disconnect,
        isConnected: !!account,
        isLoading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
