'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';
import { useVault } from '@/hooks/useVault';
import { BarbarianSVG, ArcherSVG, GiantSVG, WizardSVG } from '@/components/game/troop-svg';
import { ethers } from 'ethers';

function formatTime(seconds: number): string {
  const days = Math.floor(seconds / (60 * 60 * 24));
  const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
  const mins = Math.floor((seconds % (60 * 60)) / 60);
  const secs = seconds % 60;
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export default function ArmyPage() {
  const { isConnected, provider } = useWallet();
  const { data, loading, error, refresh, trainWizard, trainGiant, isTraining, trainingTimeRemaining } = useVault();
  const [wizardDays, setWizardDays] = useState('1');
  const [isTrainingWizard, setIsTrainingWizard] = useState(false);
  const [isTrainingGiant, setIsTrainingGiant] = useState(false);
  const [ethBalance, setEthBalance] = useState('0');
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
      if (!provider) return;
      try {
        const accounts = await provider.send('eth_accounts', []);
        if (accounts.length > 0) {
          const balance = await provider.getBalance(accounts[0]);
          setEthBalance(ethers.formatEther(balance));
        }
      } catch (error) {
        console.error('Error loading balance:', error);
      }
    }
    loadBalance();
    const interval = setInterval(loadBalance, 5000);
    return () => clearInterval(interval);
  }, [provider]);

  const handleTrainWizard = async () => {
    const days = parseInt(wizardDays);
    if (!days || days <= 0) {
      alert('Please enter a valid number of days');
      return;
    }
    try {
      setIsTrainingWizard(true);
      await trainWizard(days);
      alert(`Wizard training started! Locked for ${days} day(s). You received a Wizard NFT!`);
      setWizardDays('1');
    } catch (error: any) {
      console.error('Train wizard error:', error);
      alert(error.message || 'Failed to train wizard.');
    } finally {
      setIsTrainingWizard(false);
    }
  };

  const handleTrainGiant = async () => {
    if (parseFloat(ethBalance) < 0.2) {
      alert('You need at least 0.2 ETH to train a Giant');
      return;
    }
    try {
      setIsTrainingGiant(true);
      await trainGiant();
      alert('Giant trained! You received a Giant NFT!');
    } catch (error: any) {
      console.error('Train giant error:', error);
      alert(error.message || 'Failed to train giant.');
    } finally {
      setIsTrainingGiant(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen grass-bg">
        <div className="coc-panel p-8 text-center">
          <BarbarianSVG size={64} />
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
            {isWrongNetwork ? "Wrong Network" : "Error Loading Army"}
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
          <p className="text-[#a08060] font-display">Loading army...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden grass-bg">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 40% 60%, rgba(220,38,38,0.2) 0%, transparent 30%)',
      }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <Link href="/village">
            <button className="coc-btn-red px-4 py-2 text-sm flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Back
            </button>
          </Link>
        </header>

        {/* Title */}
        <div className="mb-8">
          <h1 className="font-display text-4xl text-[#f5e6c8] mb-2" style={{ textShadow: '0 3px 0 #2b120a' }}>
            ⚔️ Army Camp
          </h1>
          <p className="text-[#a08060] font-semibold">Train and manage your troops — each troop is an on-chain NFT</p>
        </div>

        {/* Training Status */}
        {isTraining && (
          <div className="coc-panel p-5 mb-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-6 h-6 rounded-full bg-[#d4a017] animate-pulse" />
                <div className="absolute inset-0 w-6 h-6 rounded-full bg-[#fbbf24] animate-ping opacity-30" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-display text-[#f5e6c8] mb-1">Training in Progress</p>
                <p className="text-xl font-display text-[#fbbf24]">{formatTime(trainingTimeRemaining)} remaining</p>
                <p className="text-xs text-[#a08060] mt-1">Withdrawals locked until training completes</p>
              </div>
              {/* Animated swords */}
              <div className="text-3xl" style={{ animation: 'swordClash 0.5s ease-in-out infinite' }}>⚔️</div>
            </div>
          </div>
        )}

        {/* Troops Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <TroopCard
            svg={<BarbarianSVG size={56} />}
            name="Barbarian"
            count={data.troops.barbarian}
            description="Auto-trained on deposit"
            accentColor="#f59e0b"
            badge="ERC-1155"
          />
          <TroopCard
            svg={<ArcherSVG size={56} />}
            name="Archer"
            count={data.troops.archer}
            description="Coming soon"
            accentColor="#7c3aed"
            disabled
          />
          <TroopCard
            svg={<GiantSVG size={56} />}
            name="Giant"
            count={data.troops.giant}
            description="0.2 ETH to train"
            accentColor="#92400e"
            badge={data.troops.giant >= 3 ? '✅ Fee Discount' : undefined}
          />
          <TroopCard
            svg={<WizardSVG size={56} />}
            name="Wizard"
            count={data.troops.wizard}
            description="Lock funds to train"
            accentColor="#6d28d9"
            badge="ERC-1155"
          />
        </div>

        {/* Training Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Train Wizard */}
          <div className="coc-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <WizardSVG size={48} />
              <div>
                <h3 className="font-display text-lg text-[#f5e6c8]">Train Wizard</h3>
                <p className="text-sm text-[#a08060]">Lock funds to train a wizard NFT</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#a08060] mb-2 block">Days to Lock</label>
                <input
                  type="number"
                  value={wizardDays}
                  onChange={(e) => setWizardDays(e.target.value)}
                  min="1"
                  placeholder="1"
                  className="coc-input w-full h-12 px-4 text-[#f5e6c8]"
                />
                <p className="text-xs text-[#a08060] mt-2">
                  Your ETH is locked for the specified number of days
                </p>
              </div>
              <button
                className="coc-btn-gold w-full py-3 text-base flex items-center justify-center gap-2"
                onClick={handleTrainWizard}
                disabled={isTrainingWizard || isTraining}
              >
                {isTrainingWizard ? (
                  <><div className="size-4 border-2 border-[#2b120a] border-t-transparent rounded-full animate-spin" /> Training...</>
                ) : (
                  <>🧙 Train Wizard</>
                )}
              </button>
            </div>
          </div>

          {/* Train Giant */}
          <div className="coc-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <GiantSVG size={48} />
              <div>
                <h3 className="font-display text-lg text-[#f5e6c8]">Train Giant</h3>
                <p className="text-sm text-[#a08060]">Cost: 0.2 ETH per Giant</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-[#1a0d05] border-2 border-[#5c3a1e] rounded-xl p-4">
                <p className="text-sm text-[#a08060] mb-2 font-semibold">Benefits:</p>
                <ul className="text-xs text-[#a08060] space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="text-[#fbbf24]">◆</span> Train a powerful Giant NFT (ERC-1155)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#22c55e]">◆</span> Get 3+ Giants → withdrawal fee drops from 5% to 0.5%
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#d946ef]">◆</span> Current Giants: <span className="font-bold text-[#f5e6c8]">{data.troops.giant}</span>
                    {data.troops.giant >= 3 && <span className="text-[#22c55e] font-bold">✅</span>}
                  </li>
                </ul>
              </div>
              <button
                className="coc-btn-green w-full py-3 text-base flex items-center justify-center gap-2"
                onClick={handleTrainGiant}
                disabled={isTrainingGiant || parseFloat(ethBalance) < 0.2}
              >
                {isTrainingGiant ? (
                  <><div className="size-4 border-2 border-[#052e16] border-t-transparent rounded-full animate-spin" /> Training...</>
                ) : (
                  <>🗿 Train Giant (0.2 ETH)</>
                )}
              </button>
              {parseFloat(ethBalance) < 0.2 && (
                <p className="text-xs text-[#dc2626] text-center font-semibold">Insufficient ETH (need 0.2)</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TroopCard({
  svg,
  name,
  count,
  description,
  accentColor,
  badge,
  disabled = false,
}: {
  svg: React.ReactNode;
  name: string;
  count: number;
  description: string;
  accentColor: string;
  badge?: string;
  disabled?: boolean;
}) {
  return (
    <div className={`building-tile p-5 text-center ${disabled ? 'opacity-40' : ''}`}>
      <div className="flex justify-center mb-3">
        <div className={disabled ? '' : 'animate-float'} style={{ animationDelay: `${Math.random()}s` }}>
          {svg}
        </div>
      </div>
      <h3 className="font-display text-base text-[#f5e6c8]">{name}</h3>
      <div className="font-display text-3xl my-2" style={{ color: accentColor, textShadow: '0 2px 0 rgba(0,0,0,0.3)' }}>
        {count}
      </div>
      <p className="text-[10px] text-[#a08060] mb-2">{description}</p>
      {badge && (
        <div className="inline-block px-2 py-1 rounded-lg text-[10px] font-bold" style={{
          backgroundColor: `${accentColor}20`,
          color: accentColor,
          border: `2px solid ${accentColor}40`,
        }}>
          {badge}
        </div>
      )}
    </div>
  );
}
