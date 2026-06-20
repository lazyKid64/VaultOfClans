'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';
import { useVault } from '@/hooks/useVault';
import { GoldCoinSVG, ElixirBottleSVG, TreasurySVG, EthCoinSVG } from '@/components/game/troop-svg';
import { ethers } from 'ethers';

function formatETH(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toFixed(4);
}

function getTimeRemaining(endTime: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = endTime - now;
  if (diff <= 0) return 'Ready';
  const days = Math.floor(diff / (60 * 60 * 24));
  const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((diff % (60 * 60)) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function TreasuryPage() {
  const { account, isConnected, provider } = useWallet();
  const { data, loading, error, refresh, deposit, withdraw, isTraining, trainingTimeRemaining } = useVault();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [ethBalance, setEthBalance] = useState('0');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('Ready');
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const [networkChainId, setNetworkChainId] = useState<number | null>(null);

  useEffect(() => {
    async function checkNetwork() {
      if (!provider) return;
      try {
        const net = await provider.getNetwork();
        const cid = Number(net.chainId);
        setNetworkChainId(cid);
        setIsWrongNetwork(cid !== 11155111);
      } catch (err) {
        console.error("Error checking network:", err);
      }
    }
    checkNetwork();
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("chainChanged", () => window.location.reload());
    }
  }, [provider]);

  const handleSwitchNetwork = async () => {
    if (typeof window === "undefined" || !window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
      window.location.reload();
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xaa36a7",
                chainName: "Sepolia Test Network",
                rpcUrls: ["https://rpc.ankr.com/eth_sepolia"],
                nativeCurrency: {
                  name: "Sepolia ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
          window.location.reload();
        } catch (addError) {
          console.error("Error adding network:", addError);
        }
      }
      console.error("Error switching network:", switchError);
    }
  };

  useEffect(() => {
    async function loadBalance() {
      if (!account || !provider) return;
      try {
        const balance = await provider.getBalance(account);
        setEthBalance(ethers.formatEther(balance));
      } catch (error) {
        console.error('Error loading balance:', error);
      }
    }
    loadBalance();
    const interval = setInterval(loadBalance, 5000);
    return () => clearInterval(interval);
  }, [account, provider]);

  useEffect(() => {
    if (!data) return;
    const interval = setInterval(() => {
      if (data.trainingEnd > 0) {
        setTimeRemaining(getTimeRemaining(data.trainingEnd));
      } else {
        setTimeRemaining('Ready');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (parseFloat(depositAmount) > parseFloat(ethBalance)) {
      alert('Insufficient balance');
      return;
    }
    try {
      setIsDepositing(true);
      await deposit(depositAmount);
      setDepositAmount('');
      alert('Deposit successful! You trained a Barbarian and earned $GOLD + $ELIXIR!');
    } catch (error: any) {
      console.error('Deposit error:', error);
      alert(error.message || 'Deposit failed.');
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!data || parseFloat(withdrawAmount) > parseFloat(data.balance)) {
      alert('Insufficient vault balance');
      return;
    }
    if (isTraining) {
      alert(`Cannot withdraw while training. Time remaining: ${timeRemaining}`);
      return;
    }
    try {
      setIsWithdrawing(true);
      await withdraw(withdrawAmount);
      setWithdrawAmount('');
      alert('Withdrawal successful!');
    } catch (error: any) {
      console.error('Withdraw error:', error);
      alert(error.message || 'Withdrawal failed.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen grass-bg">
        <div className="coc-panel p-8 text-center">
          <TreasurySVG size={80} />
          <h1 className="font-display text-2xl text-[#f5e6c8] mt-4 mb-4">Connect Wallet</h1>
          <Link href="/"><button className="coc-btn-gold px-6 py-3">Go Home</button></Link>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen grass-bg">
        <div className="coc-panel p-8 text-center max-w-md">
          <span className="text-4xl">⚠️</span>
          <h1 className="font-display text-2xl text-[#f5e6c8] mt-4 mb-4">
            {isWrongNetwork ? "Wrong Network" : "Error Loading Treasury"}
          </h1>
          <p className="text-[#a08060] mb-6 text-sm break-words">
            {isWrongNetwork 
              ? `You are connected to an unsupported chain (ID: ${networkChainId}). Please switch to the Sepolia testnet to interact with the game.`
              : error
            }
          </p>
          {isWrongNetwork ? (
            <button className="coc-btn-gold px-6 py-3 text-base" onClick={handleSwitchNetwork}>
              Switch to Sepolia
            </button>
          ) : (
            <button className="coc-btn-gold px-6 py-3 text-base" onClick={refresh}>
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen grass-bg">
        <div className="coc-panel p-8 text-center">
          <div className="size-10 border-4 border-[#d4a017] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a08060] font-display">Loading treasury...</p>
        </div>
      </div>
    );
  }

  const vaultBalance = parseFloat(data.balance);
  const withdrawable = isTraining ? 0 : vaultBalance;
  const locked = isTraining ? vaultBalance : 0;
  // Use the new fee system: 5% default, 0.5% with 3+ Giants
  const hasReducedFee = data.troops.giant >= 3;
  const feePercent = hasReducedFee ? '0.50' : '5.00';

  return (
    <div className="relative min-h-screen overflow-hidden grass-bg">
      {/* Ambient glow */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(212,160,23,0.3) 0%, transparent 40%)',
      }} />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <Link href="/village">
            <button className="coc-btn-red px-4 py-2 text-sm flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Back
            </button>
          </Link>
          <div className="coc-panel flex items-center gap-2 px-4 py-2">
            <EthCoinSVG size={20} />
            <span className="text-sm font-bold text-[#849DFF]">{formatETH(ethBalance)} ETH</span>
          </div>
        </header>

        {/* Treasury Title */}
        <div className="flex items-center gap-4 mb-8">
          <div className="animate-float"><TreasurySVG size={70} /></div>
          <div>
            <h1 className="font-display text-4xl text-[#f5e6c8]" style={{ textShadow: '0 3px 0 #2b120a' }}>
              Treasury Vault
            </h1>
            <p className="text-[#a08060] font-semibold">Deposit ETH to train troops and earn $GOLD</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<GoldCoinSVG size={28} />}
            label="Vault Balance"
            value={`${formatETH(data.balance)} ETH`}
            subtext={`Fee: ${feePercent}%`}
            accent="#fbbf24"
          />
          <StatCard
            icon={<EthCoinSVG size={28} />}
            label="Withdrawable"
            value={`${formatETH(withdrawable)} ETH`}
            subtext={isTraining ? 'Training in progress' : 'Available now'}
            accent="#22c55e"
          />
          <StatCard
            icon={
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="8" y="4" width="12" height="8" rx="2" fill="#9CA3AF" />
                <rect x="6" y="12" width="16" height="14" rx="3" fill="#6B7280" />
                <circle cx="14" cy="19" r="3" fill="#D4A017" />
                <rect x="13" y="19" width="2" height="4" rx="1" fill="#D4A017" />
              </svg>
            }
            label="Locked"
            value={`${formatETH(locked)} ETH`}
            subtext={isTraining ? `Unlocks in ${timeRemaining}` : 'None'}
            accent="#a08060"
          />
        </div>

        {/* Training Status */}
        {isTraining && (
          <div className="coc-panel p-5 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#d4a017] animate-pulse" />
                <span className="text-sm font-display text-[#f5e6c8]">Training in Progress</span>
              </div>
              <span className="text-sm font-bold text-[#fbbf24]">{timeRemaining}</span>
            </div>
            <div className="w-full h-3 bg-[#1a0d05] rounded-full overflow-hidden border border-[#5c3a1e]">
              <div
                className="h-full bg-gradient-to-r from-[#d4a017] to-[#fbbf24] rounded-full transition-all"
                style={{ width: `${Math.max(5, 100 - (trainingTimeRemaining / (7 * 24 * 3600)) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-[#a08060] mt-2">Withdrawals are locked until training completes.</p>
          </div>
        )}

        {/* Deposit & Withdraw */}
        <div className="grid grid-cols-2 gap-6">
          {/* Deposit */}
          <div className="coc-panel p-6">
            <div className="flex items-center gap-2 mb-4">
              <GoldCoinSVG size={24} />
              <h3 className="font-display text-lg text-[#f5e6c8]">Deposit ETH</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#a08060] mb-2 block">Amount</label>
                <div className="relative">
                  <input
                    type="text"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    className="coc-input w-full h-12 px-4 pr-16 text-[#f5e6c8] placeholder:text-[#5c3a1e]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#a08060]">ETH</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-[#a08060]">Available: {formatETH(ethBalance)} ETH</span>
                  <button className="text-xs text-[#d4a017] hover:underline" onClick={() => setDepositAmount(ethBalance)}>Max</button>
                </div>
              </div>
              <button
                className="coc-btn-gold w-full py-3 text-base flex items-center justify-center gap-2"
                onClick={handleDeposit}
                disabled={isDepositing || !depositAmount}
              >
                {isDepositing ? (
                  <><div className="size-4 border-2 border-[#2b120a] border-t-transparent rounded-full animate-spin" /> Depositing...</>
                ) : (
                  <><GoldCoinSVG size={20} /> Deposit & Train Barbarian</>
                )}
              </button>
              <div className="bg-[#1a0d05] border-2 border-[#5c3a1e] rounded-xl p-3 flex items-start gap-2">
                <span className="text-lg">⚔️</span>
                <p className="text-xs text-[#a08060]">
                  Each deposit trains 1 Barbarian NFT, mints 100 $GOLD + 50 $ELIXIR, and awards 100 XP!
                </p>
              </div>
            </div>
          </div>

          {/* Withdraw */}
          <div className="coc-panel p-6">
            <div className="flex items-center gap-2 mb-4">
              <EthCoinSVG size={24} />
              <h3 className="font-display text-lg text-[#f5e6c8]">Withdraw ETH</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#a08060] mb-2 block">Amount</label>
                <div className="relative">
                  <input
                    type="text"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="coc-input w-full h-12 px-4 pr-16 text-[#f5e6c8] placeholder:text-[#5c3a1e]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#a08060]">ETH</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-[#a08060]">Withdrawable: {formatETH(withdrawable)} ETH</span>
                  <button
                    className="text-xs text-[#d4a017] hover:underline"
                    onClick={() => setWithdrawAmount(withdrawable.toString())}
                    disabled={withdrawable === 0}
                  >Max</button>
                </div>
              </div>
              <button
                className="coc-btn-red w-full py-3 text-base flex items-center justify-center gap-2"
                onClick={handleWithdraw}
                disabled={isWithdrawing || !withdrawAmount || withdrawable === 0 || isTraining}
              >
                {isWithdrawing ? (
                  <><div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Withdrawing...</>
                ) : (
                  <><EthCoinSVG size={20} /> Withdraw</>
                )}
              </button>
              <div className="bg-[#1a0d05] border-2 border-[#5c3a1e] rounded-xl p-3 flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <p className="text-xs text-[#a08060]">
                  {isTraining
                    ? `Cannot withdraw while training. Time remaining: ${timeRemaining}`
                    : `Fee: ${feePercent}%. ${data.troops.giant >= 3 ? '✅ 3+ Giants — reduced fee!' : 'Train 3+ Giants for 0.5% fees!'}`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtext, accent }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  accent: string;
}) {
  return (
    <div className="coc-panel p-5">
      <div className="mb-3">{icon}</div>
      <p className="text-xs text-[#a08060] mb-1">{label}</p>
      <p className="text-xl font-display" style={{ color: accent, textShadow: `0 2px 0 rgba(0,0,0,0.3)` }}>{value}</p>
      <p className="text-[10px] text-[#a08060] mt-1">{subtext}</p>
    </div>
  );
}
