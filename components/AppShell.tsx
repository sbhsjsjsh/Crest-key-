'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  Building2,
  Calculator,
  LayoutDashboard,
  Menu,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react';
import { useBrokerage } from './BrokerageProvider';

interface NavItem {
  href: string;
  label: string;
  pageTitle: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    label: 'Overview',
    pageTitle: 'Executive Overview',
    subtitle: 'Brokerage volume in Cr/L, active pipeline, and advisor production',
    icon: LayoutDashboard,
  },
  {
    href: '/listings',
    label: 'Listings',
    pageTitle: 'Property Portfolio',
    subtitle: 'Manage RERA inventory and generate portal & WhatsApp copy',
    icon: Building2,
  },
  {
    href: '/leads',
    label: 'Client CRM',
    pageTitle: 'Client & Deal CRM',
    subtitle: 'Track buyers, mandates, NRI investors, and WhatsApp follow-ups',
    icon: Users,
  },
  {
    href: '/calculators',
    label: 'Calculators',
    pageTitle: 'Deal & Tax Suite',
    subtitle: 'Seller net sheet, Sec 194-IA TDS, Home Loan EMI & stamp duty',
    icon: Calculator,
  },
  {
    href: '/settings',
    label: 'White-Label',
    pageTitle: 'White-Label Agency Setup',
    subtitle: 'Customize brokerage identity, RERA details, and advisor splits',
    icon: SlidersHorizontal,
  },
  {
    href: '/how-it-works',
    label: 'How It Works',
    pageTitle: 'How It Works',
    subtitle: 'Step-by-step usage guide in Hinglish and English',
    icon: BookOpen,
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings, accent } = useBrokerage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentNav =
    NAV_ITEMS.find((item) =>
      item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
    ) ?? NAV_ITEMS[0];

  const primaryAction =
    pathname === '/listings'
      ? { href: '/listings?new=1', label: 'Add Listing' }
      : pathname === '/leads'
      ? { href: '/leads?new=1', label: 'Add Enquiry' }
      : pathname === '/calculators'
      ? { href: '/listings', label: 'View Inventory' }
      : { href: '/listings?new=1', label: 'New Listing' };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-white border-r border-slate-200 min-h-screen sticky top-0 h-screen">
        <div className="h-16 px-6 flex items-center border-b border-slate-200">
          <Link
            href="/"
            className="text-base font-bold tracking-tight text-slate-900 truncate whitespace-nowrap"
          >
            {settings.brokerageName}
          </Link>
        </div>

        <nav aria-label="Primary navigation" className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? `${accent.softBg} ${accent.primaryText}`
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <p className="text-xs font-medium text-slate-900 truncate">
            {settings.managingBroker}
          </p>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {settings.marketRegion} · {settings.reraNumber}
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar (Desktop & Mobile unified clean bar = 56px on mobile) */}
        <header className="sticky top-0 z-30 h-14 lg:h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-3.5 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 -ml-2 rounded-lg text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="hidden sm:inline text-slate-400 whitespace-nowrap shrink-0">
                {settings.brokerageName}
              </span>
              <span className="hidden sm:inline text-slate-300" aria-hidden="true">
                /
              </span>
              <h1 className="font-semibold text-slate-900 truncate whitespace-nowrap text-sm sm:text-base">
                {currentNav.pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={primaryAction.href}
              className={`inline-flex items-center justify-center px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${accent.primaryBg} ${accent.primaryHover}`}
            >
              {primaryAction.label}
            </Link>
          </div>
        </header>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-900/40"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white border-r border-slate-200 flex flex-col shadow-xl h-[100dvh]"
              >
                <div className="h-14 px-5 flex items-center justify-between border-b border-slate-200">
                  <span className="text-base font-bold text-slate-900 truncate">
                    {settings.brokerageName}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close navigation menu"
                    className="inline-flex items-center justify-center w-11 h-11 -mr-2 rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav aria-label="Mobile navigation" className="flex-1 p-3 space-y-1 overflow-y-auto">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                          isActive
                            ? `${accent.softBg} ${accent.primaryText}`
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-slate-200 bg-slate-50">
                  <p className="text-xs font-medium text-slate-900 truncate">
                    {settings.managingBroker}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {settings.marketRegion} · {settings.reraNumber}
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Viewport */}
        <main className="flex-1 px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] max-w-[1360px] w-full mx-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
