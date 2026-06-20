'use client';

import React from "react"

import { cn } from '@/lib/utils';
import { Coins, Droplets, Gem, Wallet } from 'lucide-react';
import { formatETH, formatGold } from '@/lib/mock-data';

interface ResourceBarProps {
  ethBalance: number;
  gold: number;
  maxGold: number;
  elixir: number;
  maxElixir: number;
  gems: number;
  className?: string;
}

export function ResourceBar({
  ethBalance,
  gold,
  maxGold,
  elixir,
  maxElixir,
  gems,
  className,
}: ResourceBarProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-6 bg-card/80 backdrop-blur-sm border border-border rounded-lg px-4 py-2',
        className
      )}>
      <ResourceItem
        icon={<Wallet className="size-4" />}
        value={`${formatETH(ethBalance)} ETH`}
        color="text-primary"
      />

      <ResourceItem
        icon={<Coins className="size-4" />}
        value={formatGold(gold)}
        maxValue={formatGold(maxGold)}
        color="text-gold"
        progress={(gold / maxGold) * 100}
      />

      <ResourceItem
        icon={<Droplets className="size-4" />}
        value={formatGold(elixir)}
        maxValue={formatGold(maxElixir)}
        color="text-elixir"
        progress={(elixir / maxElixir) * 100}
      />

      <ResourceItem
        icon={<Gem className="size-4" />}
        value={gems.toLocaleString()}
        color="text-gem"
      />
    </div>
  );
}

interface ResourceItemProps {
  icon: React.ReactNode;
  value: string;
  maxValue?: string;
  color: string;
  progress?: number;
}

function ResourceItem({ icon, value, maxValue, color, progress }: ResourceItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn('flex-shrink-0', color)}>{icon}</div>
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className={cn('font-semibold text-sm', color)}>{value}</span>
          {maxValue && (
            <span className="text-muted-foreground text-xs">/ {maxValue}</span>
          )}
        </div>
        {progress !== undefined && (
          <div className="w-16 h-1 bg-muted rounded-full overflow-hidden mt-0.5">
            <div
              className={cn('h-full rounded-full transition-all', {
                'bg-gold': color === 'text-gold',
                'bg-elixir': color === 'text-elixir',
              })}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
