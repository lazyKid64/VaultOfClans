'use client';

import React from 'react';
import { GoldCoinSVG, ElixirBottleSVG, GemSVG, EthCoinSVG } from './troop-svg';

interface CocResourceHudProps {
  ethBalance: number;
  gold: number;
  maxGold: number;
  elixir: number;
  maxElixir: number;
  gems: number;
  className?: string;
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toLocaleString();
}

export function CocResourceHud({
  ethBalance,
  gold,
  maxGold,
  elixir,
  maxElixir,
  gems,
  className = '',
}: CocResourceHudProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* ETH Balance */}
      <div className="resource-container flex items-center gap-2 px-3 py-1.5 min-w-[120px]">
        <EthCoinSVG size={20} />
        <span className="text-sm font-bold text-[#849DFF]">
          {ethBalance.toFixed(4)}
        </span>
      </div>

      {/* Gold */}
      <div className="relative resource-container min-w-[140px] h-8">
        <div className="absolute inset-0 flex items-center px-2 z-10">
          <GoldCoinSVG size={20} />
          <span className="ml-1.5 text-xs font-bold text-[#451a03]">
            {formatNumber(gold)}
          </span>
          <span className="ml-auto text-[10px] text-[#92400e] opacity-70">
            /{formatNumber(maxGold)}
          </span>
        </div>
        <div className="absolute inset-[3px] rounded-[14px] overflow-hidden">
          <div
            className="resource-fill-gold"
            style={{ width: `${Math.min((gold / maxGold) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Elixir */}
      <div className="relative resource-container min-w-[140px] h-8">
        <div className="absolute inset-0 flex items-center px-2 z-10">
          <ElixirBottleSVG size={20} />
          <span className="ml-1.5 text-xs font-bold text-[#fdf4ff]">
            {formatNumber(elixir)}
          </span>
          <span className="ml-auto text-[10px] text-[#d8b4fe] opacity-70">
            /{formatNumber(maxElixir)}
          </span>
        </div>
        <div className="absolute inset-[3px] rounded-[14px] overflow-hidden">
          <div
            className="resource-fill-elixir"
            style={{ width: `${Math.min((elixir / maxElixir) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Gems */}
      <div className="resource-container flex items-center gap-2 px-3 py-1.5">
        <GemSVG size={18} />
        <span className="text-sm font-bold text-[#93c5fd]">
          {gems.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
