'use client';

import React, { useState, useEffect } from 'react';
import { CocResourceHud } from '@/components/game/coc-resource-hud';
import { TownHallSVG, BarracksSVG, TreasurySVG, ArmyCampSVG, BarbarianSVG, GiantSVG, WizardSVG, ClanCastleSVG } from '@/components/game/troop-svg';
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';
import { useVault } from '@/hooks/useVault';

export default function VillagePage() {
  const { account, isConnected, provider } = useWallet();
  const { data, loading, error, refresh } = useVault();
  const [goldBalance, setGoldBalance] = useState<number | null>(null);
  const [elixirBalance, setElixirBalance] = useState<number | null>(null);
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
    async function loadTokenBalances() {
      if (!account || !provider) return;
      try {
        const { GOLD_ADDRESS, ELIXIR_ADDRESS, ERC20_ABI } = await import('@/lib/contract');
        const { Contract, formatEther } = await import('ethers');
        
        const goldContract = new Contract(GOLD_ADDRESS, ERC20_ABI, provider);
        const elixirContract = new Contract(ELIXIR_ADDRESS, ERC20_ABI, provider);
        
        const [gBal, eBal] = await Promise.all([
          goldContract.balanceOf(account).catch(() => 0n),
          elixirContract.balanceOf(account).catch(() => 0n),
        ]);
        
        setGoldBalance(Math.floor(parseFloat(formatEther(gBal))));
        setElixirBalance(Math.floor(parseFloat(formatEther(eBal))));
      } catch (err) {
        console.error("Error loading token balances in village page:", err);
      }
    }
    loadTokenBalances();
    const interval = setInterval(loadTokenBalances, 5000);
    return () => clearInterval(interval);
  }, [account, provider]);

  const currentXP = data ? data.xp : 0;
  const levelXP = currentXP % 500;
  const xpForNextLevel = 500;
  const xpProgress = (levelXP / xpForNextLevel) * 100;

  const resourceData = {
    ethBalance: data ? parseFloat(data.balance) : 0,
    storedGold: goldBalance !== null ? goldBalance : (data ? data.troops.barbarian * 1000 : 0),
    maxGold: 1000000,
    storedElixir: elixirBalance !== null ? elixirBalance : (data ? data.troops.wizard * 500 : 0),
    maxElixir: 1000000,
    gems: data ? data.troops.giant * 100 : 0,
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen grass-bg">
        <div className="coc-panel p-8 text-center">
          <TownHallSVG size={80} />
          <h1 className="font-display text-2xl text-[#f5e6c8] mt-4 mb-4">Connect Your Wallet</h1>
          <p className="text-[#a08060] mb-4">You need MetaMask to enter your village</p>
          <Link href="/">
            <button className="coc-btn-gold px-6 py-3 text-base">Go Home</button>
          </Link>
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
            {isWrongNetwork ? "Wrong Network" : "Error Loading Village"}
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

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen grass-bg">
        <div className="coc-panel p-8 text-center">
          <div className="size-10 border-4 border-[#d4a017] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a08060] font-display text-lg">Loading your village...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden grass-bg">
      {/* Grass texture overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          radial-gradient(circle at 15% 85%, #22c55e 0%, transparent 20%),
          radial-gradient(circle at 85% 25%, #15803d 0%, transparent 15%),
          radial-gradient(circle at 50% 50%, #166534 0%, transparent 25%)
        `,
      }} />

      {/* ====== TOP HUD BAR ====== */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3">
        {/* Player Info */}
        <div className="coc-panel px-4 py-2 flex items-center gap-3">
          <div className="level-badge flex items-center justify-center size-10 rounded-full text-base">
            {data?.townHall || 1}
          </div>
          <div>
            <div className="text-sm font-bold text-[#f5e6c8]">
              {account?.slice(0, 6)}...{account?.slice(-4)}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-20 h-2 bg-[#1a0d05] rounded-full overflow-hidden border border-[#5c3a1e]">
                <div
                  className="h-full bg-gradient-to-r from-[#22c55e] to-[#4ade80] rounded-full transition-all"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-[#a08060]">
                {levelXP}/{xpForNextLevel} XP
              </span>
            </div>
          </div>
        </div>

        {/* Resources */}
        <CocResourceHud
          ethBalance={resourceData.ethBalance}
          gold={resourceData.storedGold}
          maxGold={resourceData.maxGold}
          elixir={resourceData.storedElixir}
          maxElixir={resourceData.maxElixir}
          gems={resourceData.gems}
        />

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <button className="coc-btn-red px-3 py-2 text-xs">Exit</button>
          </Link>
        </div>
      </header>

      {/* ====== MAIN VILLAGE AREA ====== */}
      <main className="relative z-10 flex items-center justify-center min-h-screen pt-28 pb-28 px-6">
        <div className="relative w-full max-w-5xl">
          {/* Village Title */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl text-[#f5e6c8] mb-1" style={{ textShadow: '0 3px 0 #2b120a' }}>
              Your Village
            </h1>
            <p className="text-sm text-[#a08060]">Click buildings to explore • Hover for details</p>
          </div>

          {/* Isometric-ish Village Grid */}
          {/* Top Row: 3 buildings */}
          <div className="grid grid-cols-3 gap-10 px-8" style={{ perspective: '800px' }}>
            {/* Army Camp */}
            <Link href="/army">
              <VillageBuilding
                name="Army Camp"
                level={data?.troops.barbarian || 0}
                subtitle={`${(data?.troops.barbarian || 0) + (data?.troops.giant || 0) + (data?.troops.wizard || 0)} troops`}
                svg={<ArmyCampSVG size={90} />}
              />
            </Link>

            {/* Town Hall - Center */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="absolute -inset-3 rounded-2xl bg-[#d4a017] opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
                <div className="building-tile p-6 flex flex-col items-center animate-pulse-glow">
                  <TownHallSVG size={100} />
                  <div className="level-badge absolute -top-2 -right-2 size-10 rounded-full flex items-center justify-center text-sm">
                    {data?.townHall || 1}
                  </div>
                </div>
              </div>
              <p className="font-display text-lg text-[#f5e6c8] mt-3" style={{ textShadow: '0 2px 0 #2b120a' }}>
                Town Hall
              </p>
              <p className="text-xs text-[#d4a017]">Level {data?.townHall || 1}</p>
              <p className="text-[10px] text-[#a08060] mt-1">
                XP: {currentXP.toLocaleString()} / {xpForNextLevel.toLocaleString()}
              </p>
            </div>

            {/* Barracks */}
            <Link href="/army">
              <VillageBuilding
                name="Barracks"
                level={data?.troops.wizard || 0}
                subtitle="Train troops"
                svg={<BarracksSVG size={90} />}
              />
            </Link>
          </div>

          {/* Bottom Row: 2 buildings centered */}
          <div className="flex justify-center gap-10 mt-10 px-8">
            {/* Treasury */}
            <Link href="/treasury">
              <VillageBuilding
                name="Treasury"
                level={data ? Math.round(parseFloat(data.balance) * 10) : 0}
                subtitle={`${data ? parseFloat(data.balance).toFixed(4) : '0'} ETH`}
                svg={<TreasurySVG size={90} />}
                highlight
              />
            </Link>

            {/* Clan Castle */}
            <Link href="/clan">
              <VillageBuilding
                name="Clan Castle"
                level={data?.clanId || 0}
                subtitle={data?.clanId ? `Clan #${data.clanId}` : 'Join a clan'}
                svg={<ClanCastleSVG size={90} />}
              />
            </Link>
          </div>

          {/* Decorative troops walking */}
          <div className="absolute -bottom-4 left-0 right-0 flex justify-center gap-8 opacity-25">
            <div className="animate-float" style={{ animationDelay: '0s' }}><BarbarianSVG size={30} /></div>
            <div className="animate-float" style={{ animationDelay: '0.5s' }}><GiantSVG size={36} /></div>
            <div className="animate-float" style={{ animationDelay: '1s' }}><WizardSVG size={30} /></div>
            <div className="animate-float" style={{ animationDelay: '1.5s' }}><BarbarianSVG size={28} /></div>
          </div>
        </div>
      </main>

      {/* ====== BOTTOM NAV BAR ====== */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-3 px-6 py-4">
        <div className="coc-panel flex items-center gap-2 px-4 py-2">
          <Link href="/">
            <button className="coc-btn-red px-4 py-2 text-sm">Home</button>
          </Link>
          <div className="w-px h-6 bg-[#5c3a1e]" />
          <Link href="/treasury">
            <button className="coc-btn-gold px-4 py-2 text-sm">Open Treasury</button>
          </Link>
          <div className="w-px h-6 bg-[#5c3a1e]" />
          <Link href="/army">
            <button className="coc-btn-green px-4 py-2 text-sm">Army</button>
          </Link>
          <div className="w-px h-6 bg-[#5c3a1e]" />
          <Link href="/clan">
            <button className="coc-btn-gold px-4 py-2 text-sm">Clan</button>
          </Link>
        </div>
      </footer>
    </div>
  );
}

function VillageBuilding({
  name,
  level,
  subtitle,
  svg,
  highlight = false,
}: {
  name: string;
  level: number;
  subtitle: string;
  svg: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center group cursor-pointer">
      <div className={`building-tile p-5 flex flex-col items-center relative ${highlight ? 'animate-pulse-glow' : ''}`}>
        {/* Construction sparkles on hover */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 rounded-full bg-[#fbbf24] animate-construction" />
        </div>
        <div className="absolute -top-1 left-1/3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ animationDelay: '0.3s' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-[#fde68a] animate-construction" style={{ animationDelay: '0.3s' }} />
        </div>

        {svg}

        {/* Level badge */}
        <div className="level-badge absolute -top-2 -right-2 size-7 rounded-full flex items-center justify-center text-xs">
          {level}
        </div>
      </div>
      <p className="font-display text-sm text-[#f5e6c8] mt-2" style={{ textShadow: '0 1px 0 #2b120a' }}>
        {name}
      </p>
      <p className="text-[10px] text-[#a08060]">{subtitle}</p>
    </div>
  );
}
