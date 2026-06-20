'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';
import { useVault } from '@/hooks/useVault';
import { GoldCoinSVG, ClanCastleSVG } from '@/components/game/troop-svg';

export default function ClanPage() {
  const { isConnected, provider } = useWallet();
  const { data, loading, error, refresh, joinClan } = useVault();
  const [clanId, setClanId] = useState('1');
  const [isJoining, setIsJoining] = useState(false);
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

  const handleJoinClan = async () => {
    const id = parseInt(clanId);
    if (!id || id <= 0) {
      alert('Please enter a valid clan ID (1 or higher)');
      return;
    }
    try {
      setIsJoining(true);
      await joinClan(id);
      alert(`Successfully joined Clan #${id}!`);
      setClanId('1');
    } catch (error: any) {
      console.error('Join clan error:', error);
      alert(error.message || 'Failed to join clan.');
    } finally {
      setIsJoining(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen grass-bg">
        <div className="coc-panel p-8 text-center">
          <ClanCastleSVG size={64} />
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
            {isWrongNetwork ? "Wrong Network" : "Error Loading Clan"}
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
          <p className="text-[#a08060] font-display">Loading clan data...</p>
        </div>
      </div>
    );
  }

  const currentClanId = data.clanId;
  const clanData = data.clanData;

  return (
    <div className="relative min-h-screen overflow-hidden grass-bg">
      <div className="absolute inset-0 opacity-15" style={{
        backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(124,58,237,0.3) 0%, transparent 40%)',
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
        </header>

        {/* Title */}
        <div className="flex items-center gap-4 mb-8">
          <div className="animate-float"><ClanCastleSVG size={64} /></div>
          <div>
            <h1 className="font-display text-4xl text-[#f5e6c8]" style={{ textShadow: '0 3px 0 #2b120a' }}>
              Clans
            </h1>
            <p className="text-[#a08060] font-semibold">Join a clan to contribute and level up together</p>
          </div>
        </div>

        {/* Current Clan Status */}
        {currentClanId > 0 && clanData ? (
          <div className="coc-panel p-6 mb-8">
            <div className="flex items-center gap-4 mb-5">
              <div className="level-badge size-16 rounded-xl flex items-center justify-center text-2xl">
                {clanData.level}
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl text-[#f5e6c8]">Your Clan</h2>
                <p className="text-[#d4a017] font-display text-sm">Clan #{currentClanId}</p>
              </div>
              {/* Shield / Banner */}
              <div className="relative">
                <svg width="48" height="56" viewBox="0 0 48 56" fill="none">
                  <path d="M4 4 L44 4 L44 36 L24 52 L4 36 Z" fill="#6D28D9" stroke="#4C1D95" strokeWidth="3" />
                  <path d="M8 8 L40 8 L40 33 L24 46 L8 33 Z" fill="#7C3AED" />
                  <path d="M20 18 L24 12 L28 18 L24 22 Z" fill="#D4A017" />
                  <circle cx="24" cy="30" r="5" fill="#D4A017" />
                </svg>
                <div className="absolute inset-0" style={{ animation: 'bannerWave 3s ease-in-out infinite' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1a0d05] border-2 border-[#5c3a1e] rounded-xl p-4">
                <p className="text-sm text-[#a08060] mb-1">Total Clan Balance</p>
                <div className="flex items-center gap-2">
                  <GoldCoinSVG size={20} />
                  <p className="text-lg font-display text-[#fbbf24]">{parseFloat(clanData.totalBalance).toFixed(4)} ETH</p>
                </div>
              </div>
              <div className="bg-[#1a0d05] border-2 border-[#5c3a1e] rounded-xl p-4">
                <p className="text-sm text-[#a08060] mb-1">Clan Level</p>
                <p className="text-lg font-display text-[#7c3aed]">Level {clanData.level}</p>
                <p className="text-[10px] text-[#a08060] mt-1">+1 level per 5 ETH</p>
              </div>
            </div>
            <div className="mt-4 bg-[#1a0d05] border-2 border-[#5c3a1e] rounded-xl p-3">
              <p className="text-xs text-[#a08060] flex items-center gap-2">
                <span className="text-[#22c55e]">◆</span>
                Your deposits automatically contribute to the clan&apos;s total balance and help level up the clan!
              </p>
            </div>
          </div>
        ) : (
          <div className="coc-panel p-6 mb-8 text-center">
            <ClanCastleSVG size={64} />
            <p className="text-[#a08060] mt-3 font-display">You are not in a clan yet. Join one below!</p>
          </div>
        )}

        {/* Join Clan */}
        <div className="coc-panel p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🏰</span>
            <h3 className="font-display text-lg text-[#f5e6c8]">Join a Clan</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-[#a08060] mb-2 block">Clan ID</label>
              <input
                type="number"
                value={clanId}
                onChange={(e) => setClanId(e.target.value)}
                min="1"
                placeholder="1"
                className="coc-input w-full h-12 px-4 text-[#f5e6c8]"
              />
              <p className="text-xs text-[#a08060] mt-2">Enter the ID of the clan you want to join (1 or higher)</p>
            </div>
            <button
              className="coc-btn-gold w-full py-3 text-base flex items-center justify-center gap-2"
              onClick={handleJoinClan}
              disabled={isJoining || currentClanId > 0}
            >
              {isJoining ? (
                <><div className="size-4 border-2 border-[#2b120a] border-t-transparent rounded-full animate-spin" /> Joining...</>
              ) : currentClanId > 0 ? (
                <>🏰 Already in Clan #{currentClanId}</>
              ) : (
                <>🏰 Join Clan</>
              )}
            </button>
          </div>
        </div>

        {/* Clan Benefits */}
        <div className="coc-panel p-6">
          <h3 className="font-display text-lg text-[#f5e6c8] mb-4">Clan Benefits</h3>
          <div className="space-y-4">
            <BenefitRow
              icon="👑"
              title="Contribute to Clan"
              description="Your deposits automatically contribute to your clan's total balance"
            />
            <BenefitRow
              icon="📈"
              title="Level Up Together"
              description="Clan level increases based on total balance (1 level per 5 ETH)"
            />
            <BenefitRow
              icon="🤝"
              title="Teamwork"
              description="Work together with other players to build the strongest clan"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BenefitRow({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 bg-[#1a0d05] border-2 border-[#5c3a1e] rounded-xl p-4">
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div>
        <p className="text-sm font-display text-[#f5e6c8]">{title}</p>
        <p className="text-xs text-[#a08060] mt-1">{description}</p>
      </div>
    </div>
  );
}


