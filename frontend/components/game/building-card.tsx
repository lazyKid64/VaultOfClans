'use client';

import React from "react"

import { cn } from '@/lib/utils';
import type { Building } from '@/lib/mock-data';
import { 
  Tent, 
  Sword, 
  Vault, 
  FlaskConical, 
  Castle,
  ArrowUp,
  Users,
} from 'lucide-react';

interface BuildingCardProps {
  building: Building;
  onClick?: () => void;
  className?: string;
}

const buildingIcons: Record<Building['type'], React.ReactNode> = {
  'army-camp': <Tent className="size-8" />,
  'barracks': <Sword className="size-8" />,
  'treasury': <Vault className="size-8" />,
  'laboratory': <FlaskConical className="size-8" />,
  'clan-castle': <Castle className="size-8" />,
};

const buildingColors: Record<Building['type'], string> = {
  'army-camp': 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 hover:border-emerald-400/50',
  'barracks': 'from-orange-500/20 to-orange-600/10 border-orange-500/30 hover:border-orange-400/50',
  'treasury': 'from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-400/50',
  'laboratory': 'from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-400/50',
  'clan-castle': 'from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-400/50',
};

const iconColors: Record<Building['type'], string> = {
  'army-camp': 'text-emerald-400',
  'barracks': 'text-orange-400',
  'treasury': 'text-amber-400',
  'laboratory': 'text-purple-400',
  'clan-castle': 'text-blue-400',
};

export function BuildingCard({ building, onClick, className }: BuildingCardProps) {
  const levelProgress = (building.level / building.maxLevel) * 100;
  const capacityProgress = building.currentUnits && building.capacity 
    ? (building.currentUnits / building.capacity) * 100 
    : 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-300',
        'bg-gradient-to-b cursor-pointer building-hover',
        buildingColors[building.type],
        className
      )}
    >
      <div className="absolute -top-2 -right-2 flex items-center justify-center size-8 bg-secondary border-2 border-primary rounded-full">
        <span className="text-primary font-bold text-xs">{building.level}</span>
      </div>
      <div className={cn(
        'flex items-center justify-center size-16 rounded-full bg-card/50 mb-3',
        'group-hover:scale-110 transition-transform duration-300',
        iconColors[building.type]
      )}>
        {buildingIcons[building.type]}
      </div>

      <h3 className="text-foreground font-semibold text-sm mb-1">{building.name}</h3>
      <div className="w-full mb-2">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Level</span>
          <span>{building.level}/{building.maxLevel}</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
      </div>

      {building.capacity && (
        <div className="w-full">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              Capacity
            </span>
            <span>{building.currentUnits}/{building.capacity}</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${capacityProgress}%` }}
            />
          </div>
        </div>
      )}

      {building.level < building.maxLevel && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUp className="size-3" />
          <span>Upgrade</span>
        </div>
      )}
    </button>
  );
}
