'use client';

import React from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Building } from '@/lib/mock-data';
import { mockTroops, formatGold } from '@/lib/mock-data';
import {
  Tent,
  Sword,
  Vault,
  FlaskConical,
  Castle,
  ArrowUp,
  Clock,
  Coins,
  Droplets,
  Users,
  Shield,
  Target,
  Sparkles,
  Flame,
} from 'lucide-react';

interface BuildingModalProps {
  building: Building | null;
  onClose: () => void;
}

const buildingIcons: Record<Building['type'], React.ReactNode> = {
  'army-camp': <Tent className="size-8" />,
  'barracks': <Sword className="size-8" />,
  'treasury': <Vault className="size-8" />,
  'laboratory': <FlaskConical className="size-8" />,
  'clan-castle': <Castle className="size-8" />,
};

const iconColors: Record<Building['type'], string> = {
  'army-camp': 'text-emerald-400 bg-emerald-400/10',
  'barracks': 'text-orange-400 bg-orange-400/10',
  'treasury': 'text-amber-400 bg-amber-400/10',
  'laboratory': 'text-purple-400 bg-purple-400/10',
  'clan-castle': 'text-blue-400 bg-blue-400/10',
};

const troopIcons: Record<string, React.ReactNode> = {
  'sword': <Sword className="size-4" />,
  'target': <Target className="size-4" />,
  'shield': <Shield className="size-4" />,
  'sparkles': <Sparkles className="size-4" />,
  'flame': <Flame className="size-4" />,
};

export function BuildingModal({ building, onClose }: BuildingModalProps) {
  if (!building) return null;

  const levelProgress = (building.level / building.maxLevel) * 100;
  const capacityProgress = building.currentUnits && building.capacity
    ? (building.currentUnits / building.capacity) * 100
    : 0;

  const showTroops = building.type === 'army-camp' || building.type === 'barracks';

  return (
    <Dialog open={!!building} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader className="pb-0">
          {/* Building Icon & Title */}
          <div className="flex items-start gap-4">
            <div className={cn(
              'flex items-center justify-center size-16 rounded-xl',
              iconColors[building.type]
            )}>
              {buildingIcons[building.type]}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                {building.name}
                <span className="px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full">
                  Level {building.level}
                </span>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                {building.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="Building Level"
              value={`${building.level} / ${building.maxLevel}`}
              progress={levelProgress}
              progressColor="bg-primary"
            />

            {building.capacity && (
              <StatCard
                label="Capacity"
                value={`${building.currentUnits} / ${building.capacity}`}
                progress={capacityProgress}
                progressColor="bg-accent"
                icon={<Users className="size-4" />}
              />
            )}
          </div>

          {showTroops && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Troops Stationed</h4>
              <div className="grid grid-cols-2 gap-2">
                {mockTroops.slice(0, 4).map((troop) => (
                  <div
                    key={troop.id}
                    className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border border-border"
                  >
                    <div className="flex items-center justify-center size-8 rounded-lg bg-card text-primary">
                      {troopIcons[troop.icon]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground truncate">
                          {troop.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Lv.{troop.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full"
                            style={{ width: `${(troop.count / troop.maxCount) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {troop.count}/{troop.maxCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {building.level < building.maxLevel && (
            <div className="p-4 bg-secondary/30 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <ArrowUp className="size-4 text-primary" />
                  Upgrade to Level {building.level + 1}
                </h4>
                {building.upgradeTime && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {building.upgradeTime}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mb-4">
                {building.upgradeCost?.gold && (
                  <div className="flex items-center gap-2">
                    <Coins className="size-4 text-gold" />
                    <span className="text-sm font-medium text-gold">
                      {formatGold(building.upgradeCost.gold)}
                    </span>
                  </div>
                )}
                {building.upgradeCost?.elixir && (
                  <div className="flex items-center gap-2">
                    <Droplets className="size-4 text-elixir" />
                    <span className="text-sm font-medium text-elixir">
                      {formatGold(building.upgradeCost.elixir)}
                    </span>
                  </div>
                )}
              </div>

              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled
              >
                <ArrowUp className="size-4" />
                Upgrade (Coming Soon)
              </Button>
            </div>
          )}

          {building.level >= building.maxLevel && (
            <div className="flex items-center justify-center p-4 bg-accent/10 rounded-xl border border-accent/20">
              <span className="text-sm font-medium text-accent">Maximum Level Reached</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({
  label,
  value,
  progress,
  progressColor,
  icon,
}: {
  label: string;
  value: string;
  progress: number;
  progressColor: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-secondary/30 rounded-xl border border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          {icon}
          {label}
        </span>
        <span className="text-sm font-semibold text-foreground">{value}</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', progressColor)}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
