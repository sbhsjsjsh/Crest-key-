import { AccentTheme } from './types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactCurrency(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_00_00_000) {
    return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`;
  }
  if (abs >= 1_00_000) {
    return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`;
  }
  if (abs >= 1_000) {
    return `${sign}₹${Math.round(abs / 1_000)}K`;
  }
  return formatCurrency(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

export interface AccentTokens {
  label: string;
  swatch: string;
  primaryBg: string;
  primaryHover: string;
  primaryText: string;
  softBg: string;
  softBorder: string;
  ring: string;
}

export const ACCENT_THEMES: Record<AccentTheme, AccentTokens> = {
  [AccentTheme.COBALT]: {
    label: 'Cobalt Navy',
    swatch: '#1D4ED8',
    primaryBg: 'bg-blue-700',
    primaryHover: 'hover:bg-blue-800',
    primaryText: 'text-blue-700',
    softBg: 'bg-blue-50',
    softBorder: 'border-blue-200',
    ring: 'focus-visible:ring-blue-600',
  },
  [AccentTheme.EMERALD]: {
    label: 'Forest Teal',
    swatch: '#0F766E',
    primaryBg: 'bg-teal-700',
    primaryHover: 'hover:bg-teal-800',
    primaryText: 'text-teal-700',
    softBg: 'bg-teal-50',
    softBorder: 'border-teal-200',
    ring: 'focus-visible:ring-teal-600',
  },
  [AccentTheme.SLATE]: {
    label: 'Architectural Obsidian',
    swatch: '#0F172A',
    primaryBg: 'bg-slate-900',
    primaryHover: 'hover:bg-slate-800',
    primaryText: 'text-slate-900',
    softBg: 'bg-slate-100',
    softBorder: 'border-slate-300',
    ring: 'focus-visible:ring-slate-900',
  },
  [AccentTheme.AMBER]: {
    label: 'Saffron Bronze',
    swatch: '#B45309',
    primaryBg: 'bg-amber-700',
    primaryHover: 'hover:bg-amber-800',
    primaryText: 'text-amber-700',
    softBg: 'bg-amber-50',
    softBorder: 'border-amber-200',
    ring: 'focus-visible:ring-amber-600',
  },
};
