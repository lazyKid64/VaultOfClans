"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/context/WalletContext";
import { VAULT_ADDRESS, VAULT_ABI } from "@/lib/contract";

export interface VaultData {
  balance: string;
  townHall: number;
  xp: number;
  trainingEnd: number;
  withdrawFeeBps: number;
  feeReduced: boolean;
  troops: {
    barbarian: number;
    archer: number;
    giant: number;
    wizard: number;
  };
  clanId: number;
  clanData?: {
    totalBalance: string;
    level: number;
  };
}

export function useVault() {
  const { account, provider, signer } = useWallet();
  const [data, setData] = useState<VaultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnceRef = useRef(false);

  const loadData = useCallback(async () => {
    if (!account || !provider) {
      setData(null);
      setLoading(false);
      hasLoadedOnceRef.current = false;
      return;
    }

    try {
      if (!hasLoadedOnceRef.current) {
        setLoading(true);
      }
      setError(null);

      const contract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);

      const [
        balance,
        townHall,
        xp,
        trainingEnd,
        withdrawFeeBps,
        feeReducedVal,
        barbarian,
        archer,
        giant,
        wizard,
        clanId,
      ] = await Promise.all([
        contract.balance(account),
        contract.townHall(account),
        contract.xp(account),
        contract.trainingEnd(account),
        contract.getWithdrawFeeBps(account),
        contract.feeReduced(account),
        contract.troops(account, 0), // Barbarian
        contract.troops(account, 1), // Archer
        contract.troops(account, 2), // Giant
        contract.troops(account, 3), // Wizard
        contract.clanOf(account),
      ]);

      let clanData = undefined;
      if (Number(clanId) > 0) {
        const clan = await contract.clans(clanId);
        clanData = {
          totalBalance: ethers.formatEther(clan.totalBalance),
          level: Number(clan.level),
        };
      }

      setData({
        balance: ethers.formatEther(balance),
        townHall: Number(townHall),
        xp: Number(xp),
        trainingEnd: Number(trainingEnd),
        withdrawFeeBps: Number(withdrawFeeBps),
        feeReduced: Boolean(feeReducedVal),
        troops: {
          barbarian: Number(barbarian),
          archer: Number(archer),
          giant: Number(giant),
          wizard: Number(wizard),
        },
        clanId: Number(clanId),
        clanData,
      });
      hasLoadedOnceRef.current = true;
    } catch (err: any) {
      console.error("Error loading vault data:", err);
      setError(err.message || "Failed to load vault data");
      setData(null);
      hasLoadedOnceRef.current = true;
    } finally {
      setLoading(false);
    }
  }, [account, provider]);

  useEffect(() => {
    hasLoadedOnceRef.current = false;
    loadData();
    if (account && provider) {
      const interval = setInterval(() => {
        loadData();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [loadData]);

  async function deposit(amount: string) {
    if (!signer) throw new Error("Wallet not connected");
    const contract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);
    const tx = await contract.deposit({
      value: ethers.parseEther(amount),
    });
    await tx.wait();
    await loadData();
    return tx;
  }

  async function withdraw(amount: string) {
    if (!signer) throw new Error("Wallet not connected");
    const contract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);
    const tx = await contract.withdraw(ethers.parseEther(amount));
    await tx.wait();
    await loadData();
    return tx;
  }

  async function trainWizard(daysLocked: number) {
    if (!signer) throw new Error("Wallet not connected");
    const contract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);
    const tx = await contract.trainWizard(daysLocked);
    await tx.wait();
    await loadData();
    return tx;
  }

  async function trainGiant() {
    if (!signer) throw new Error("Wallet not connected");
    const contract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);
    const tx = await contract.trainGiant({
      value: ethers.parseEther("0.2"),
    });
    await tx.wait();
    await loadData();
    return tx;
  }

  async function joinClan(clanId: number) {
    if (!signer) throw new Error("Wallet not connected");
    const contract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);
    const tx = await contract.joinClan(clanId);
    await tx.wait();
    await loadData();
    return tx;
  }

  const isTraining = data ? data.trainingEnd > Math.floor(Date.now() / 1000) : false;
  const trainingTimeRemaining = data && isTraining
    ? Math.max(0, data.trainingEnd - Math.floor(Date.now() / 1000))
    : 0;

  return {
    data,
    loading,
    error,
    refresh: loadData,
    deposit,
    withdraw,
    trainWizard,
    trainGiant,
    joinClan,
    isTraining,
    trainingTimeRemaining,
  };
}
