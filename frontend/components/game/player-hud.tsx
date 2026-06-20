'use client';

import { cn } from '@/lib/utils';
import { Shield, Star } from 'lucide-react';
import type { PlayerData } from '@/lib/mock-data';

interface PlayerHUDProps {
  player: PlayerData;
  className?: string;
}

export function PlayerHUD({ player, className }: PlayerHUDProps) {
  const expProgress = (player.experience / player.experienceToNextLevel) * 100;

  return (
    <div
      className={cn(
        'flex items-center gap-4 bg-card/80 backdrop-blur-sm border border-border rounded-lg px-4 py-2',
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
        <div className="relative flex items-center justify-center size-10 bg-secondary border-2 border-primary rounded-full">
          <span className="text-primary font-bold text-sm">{player.level}</span>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-foreground font-semibold text-sm">
            {player.address}
          </span>
          <div className="flex items-center gap-1 text-primary">
            <Star className="size-3 fill-current" />
            <span className="text-xs">Lv.{player.level}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${expProgress}%` }}
            />
          </div>
          <span className="text-muted-foreground text-xs">
            {player.experience.toLocaleString()} / {player.experienceToNextLevel.toLocaleString()} XP
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
        <Shield className="size-4 text-accent" />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Village</span>
          <span className="text-sm font-semibold text-accent">Level {player.villageLevel}</span>
        </div>
      </div>
    </div>
  );
}
