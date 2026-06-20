'use client';

import React from 'react';
import Image from 'next/image';

// =====================================================
// TROOP CHARACTER IMAGES
// Uses generated Clash of Clans style art assets
// =====================================================

export function BarbarianImage({ size = 64 }: { size?: number }) {
  return (
    <Image
      src="/images/barbarian.png"
      alt="Barbarian"
      width={size}
      height={size}
      className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
      style={{ width: size, height: size }}
    />
  );
}

export function ArcherImage({ size = 64 }: { size?: number }) {
  return (
    <Image
      src="/images/archer.png"
      alt="Archer"
      width={size}
      height={size}
      className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
      style={{ width: size, height: size }}
    />
  );
}

export function GiantImage({ size = 64 }: { size?: number }) {
  return (
    <Image
      src="/images/giant.png"
      alt="Giant"
      width={size}
      height={size}
      className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
      style={{ width: size, height: size }}
    />
  );
}

export function WizardImage({ size = 64 }: { size?: number }) {
  return (
    <Image
      src="/images/wizard.png"
      alt="Wizard"
      width={size}
      height={size}
      className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
      style={{ width: size, height: size }}
    />
  );
}

// =====================================================
// BUILDING CHARACTER IMAGES
// Uses generated Clash of Clans style art assets
// =====================================================

export function TownHallImage({ size = 80 }: { size?: number }) {
  return (
    <Image
      src="/images/townhall.png"
      alt="Town Hall"
      width={size}
      height={size}
      className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
      style={{ width: size, height: size }}
    />
  );
}

export function BarracksImage({ size = 80 }: { size?: number }) {
  return (
    <Image
      src="/images/barracks.png"
      alt="Barracks"
      width={size}
      height={size}
      className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
      style={{ width: size, height: size }}
    />
  );
}

export function ArmyCampImage({ size = 80 }: { size?: number }) {
  return (
    <Image
      src="/images/armycamp.png"
      alt="Army Camp"
      width={size}
      height={size}
      className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
      style={{ width: size, height: size }}
    />
  );
}

export function TreasuryImage({ size = 80 }: { size?: number }) {
  return (
    <Image
      src="/images/treasury.png"
      alt="Treasury"
      width={size}
      height={size}
      className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
      style={{ width: size, height: size }}
    />
  );
}

export function ClanCastleImage({ size = 80 }: { size?: number }) {
  return (
    <Image
      src="/images/clan-castle.png"
      alt="Clan Castle"
      width={size}
      height={size}
      className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
      style={{ width: size, height: size }}
    />
  );
}

// =====================================================
// RESOURCE ICONS
// =====================================================

export function GoldCoinSVG({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#F59E0B" />
      <circle cx="12" cy="12" r="8" fill="#FBBF24" />
      <circle cx="12" cy="12" r="6" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
      <text x="12" y="16" textAnchor="middle" fill="#92400E" fontWeight="bold" fontSize="10" fontFamily="sans-serif">$</text>
    </svg>
  );
}

export function ElixirBottleSVG({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="2" width="4" height="5" rx="1" fill="#A855F7" />
      <path d="M8 8 Q8 6 10 7 L14 7 Q16 6 16 8 L18 18 Q18 22 12 22 Q6 22 6 18 Z" fill="#D946EF" />
      <path d="M9 10 Q9 8 11 9 L13 9 Q15 8 15 10 L16 17 Q16 20 12 20 Q8 20 8 17 Z" fill="#E879F9" opacity="0.6" />
      <rect x="9.5" y="1" width="5" height="3" rx="1" fill="#8B5A2B" />
      <circle cx="11" cy="15" r="1" fill="white" opacity="0.4" />
      <circle cx="13" cy="13" r="0.8" fill="white" opacity="0.3" />
      <circle cx="10" cy="18" r="0.6" fill="white" opacity="0.3" />
    </svg>
  );
}

export function GemSVG({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2 L20 9 L12 22 L4 9 Z" fill="#3B82F6" />
      <path d="M12 2 L20 9 L12 12 Z" fill="#60A5FA" />
      <path d="M12 2 L4 9 L12 12 Z" fill="#2563EB" />
      <path d="M4 9 L12 12 L12 22 Z" fill="#1D4ED8" />
      <path d="M20 9 L12 12 L12 22 Z" fill="#3B82F6" />
      <path d="M8 7 L12 4 L14 8 Z" fill="white" opacity="0.3" />
    </svg>
  );
}

export function EthCoinSVG({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#627EEA" />
      <circle cx="12" cy="12" r="8.5" fill="#849DFF" opacity="0.3" />
      <path d="M12 4 L17 12 L12 15 L7 12 Z" fill="white" opacity="0.9" />
      <path d="M12 15 L17 12 L12 20 L7 12 Z" fill="white" opacity="0.6" />
      <path d="M12 4 L12 15 L7 12 Z" fill="white" opacity="0.7" />
    </svg>
  );
}

// =====================================================
// BACKWARD COMPAT — old SVG names mapped to images
// =====================================================
export const BarbarianSVG = BarbarianImage;
export const ArcherSVG = ArcherImage;
export const GiantSVG = GiantImage;
export const WizardSVG = WizardImage;
export const TownHallSVG = TownHallImage;
export const BarracksSVG = BarracksImage;
export const ArmyCampSVG = ArmyCampImage;
export const TreasurySVG = TreasuryImage;
export const ClanCastleSVG = ClanCastleImage;

