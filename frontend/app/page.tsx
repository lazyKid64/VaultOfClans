'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { TownHallSVG, BarbarianSVG, GiantSVG, WizardSVG, GoldCoinSVG, TreasurySVG } from '@/components/game/troop-svg';

export default function LandingPage() {
  const { connect, isConnected, account, isLoading } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden grass-bg">
      {/* Animated sparkle particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-[#fbbf24] animate-sparkle"
            style={{
              left: `${15 + i * 10}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* Grass blades decoration at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 opacity-40"
        style={{
          background: `
            repeating-linear-gradient(
              80deg,
              transparent 0,
              transparent 5px,
              rgba(34, 197, 94, 0.15) 5px,
              rgba(34, 197, 94, 0.15) 6px
            )
          `,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Title & Logo */}
        <div className="flex flex-col items-center mb-10">
          {/* Town Hall emblem */}
          <div className="relative mb-6 animate-float">
            <div className="absolute inset-0 blur-2xl rounded-full bg-[#d4a017] opacity-30" />
            <TownHallSVG size={100} />
          </div>

          <h1 className="coc-heading text-6xl mb-3 text-center tracking-wide">
            Vault of Clans
          </h1>
          <p className="text-[#a08060] text-lg text-center max-w-md font-semibold">
            Build your village. Train your army. Stake your ETH.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-3 gap-5 mb-10 max-w-2xl w-full">
          <FeatureCard
            icon={<BarbarianSVG size={48} />}
            title="Build & Battle"
            description="Train troops on-chain"
          />
          <FeatureCard
            icon={<TreasurySVG size={48} />}
            title="Earn Rewards"
            description="Stake ETH for $GOLD"
          />
          <FeatureCard
            icon={<WizardSVG size={48} />}
            title="Collect NFTs"
            description="Own your army"
          />
        </div>

        {/* CTA Button */}
        <div className="flex flex-col items-center gap-4">
          <Link href={isConnected ? '/village' : '#'}>
            <button
              className="coc-btn-gold h-16 px-12 text-xl flex items-center gap-3"
              onClick={async (e) => {
                if (!isConnected) {
                  e.preventDefault();
                  setIsConnecting(true);
                  try {
                    await connect();
                    router.push('/village');
                  } catch (error) {
                    console.error('Connection error:', error);
                  } finally {
                    setIsConnecting(false);
                  }
                }
              }}
              disabled={isLoading || isConnecting}
            >
              {isLoading || isConnecting ? (
                <>
                  <div className="size-5 border-3 border-[#2b120a] border-t-transparent rounded-full animate-spin" />
                  {isConnecting ? 'Connecting...' : 'Loading...'}
                </>
              ) : (
                <>
                  <GoldCoinSVG size={28} />
                  {isConnected ? 'Enter Village' : 'Connect & Play'}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 4L13 10L7 16" stroke="#2b120a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </Link>

          {isConnected && (
            <div className="coc-panel px-4 py-2 text-sm text-[#a08060]">
              ⚡ Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
            </div>
          )}

          {!isConnected && (
            <p className="text-xs text-[#a08060] mt-2 text-center max-w-sm">
              Connect your MetaMask wallet to enter your village and start staking ETH
            </p>
          )}
        </div>

        {/* Bottom decorative troops */}
        <div className="flex items-end gap-6 mt-12 opacity-30">
          <BarbarianSVG size={40} />
          <GiantSVG size={50} />
          <WizardSVG size={40} />
          <BarbarianSVG size={36} />
          <GiantSVG size={44} />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="building-tile flex flex-col items-center p-5 hover:cursor-pointer">
      <div className="mb-3 animate-float" style={{ animationDelay: '0.2s' }}>
        {icon}
      </div>
      <span className="font-display text-sm text-[#f5e6c8] mb-1">{title}</span>
      <span className="text-xs text-[#a08060] text-center">{description}</span>
    </div>
  );
}
