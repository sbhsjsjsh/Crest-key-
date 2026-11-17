'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useBrokerage } from './BrokerageProvider';
import { PropertyImage } from './PropertyImage';
import { formatCompactCurrency } from '@/lib/format';
import { LeadStage, ListingStatus } from '@/lib/types';

export function DashboardView() {
  const { settings, listings, leads, agents, accent } = useBrokerage();

  const activeListings = listings.filter((l) => l.status === ListingStatus.ACTIVE);
  const pendingListings = listings.filter((l) => l.status === ListingStatus.PENDING);

  const activeAndPendingVolume = [...activeListings, ...pendingListings].reduce(
    (sum, item) => sum + item.price,
    0
  );

  const pendingVolume = pendingListings.reduce((sum, item) => sum + item.price, 0);

  const projectedBrokerage = [...activeListings, ...pendingListings].reduce(
    (sum, item) => sum + item.price * (item.commissionRate / 100),
    0
  );

  const avgDom =
    activeListings.length > 0
      ? Math.round(
          activeListings.reduce((sum, l) => sum + l.daysOnMarket, 0) /
            activeListings.length
        )
      : 0;

  const activeLeads = leads.filter((l) => l.stage !== LeadStage.CLOSED);
  const totalPipelineBudget = activeLeads.reduce((sum, l) => sum + l.budget, 0);

  const stages = [
    LeadStage.NEW,
    LeadStage.TOURING,
    LeadStage.OFFER,
    LeadStage.CONTRACT,
  ];

  const getStatusTextClass = (status: ListingStatus) => {
    if (status === ListingStatus.ACTIVE) return 'text-emerald-700';
    if (status === ListingStatus.PENDING) return 'text-amber-700';
    return 'text-slate-500';
  };

  return (
    <div className="space-y-6">
      {/* Executive Brokerage Context Banner */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500">
            {settings.marketRegion} · RERA {settings.reraNumber}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {settings.brokerageName} Command Centre
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl">
            Live RERA inventory, HNI & NRI buyer pipeline, and brokerage underwriting
            for {agents.length} channel advisors.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
          <Link
            href="/calculators"
            className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap min-h-[44px]"
          >
            <span>Net Sheet & EMI</span>
          </Link>
          <Link
            href="/settings"
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-white rounded-lg transition-colors whitespace-nowrap min-h-[44px] ${accent.primaryBg} ${accent.primaryHover}`}
          >
            <span>White-Label</span>
            <ArrowUpRight className="w-4 h-4 shrink-0" />
          </Link>
        </div>
      </section>

      {/* 4-Column KPI Strip */}
      <section
        aria-label="Key brokerage metrics"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Active & Token Inventory</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {formatCompactCurrency(activeAndPendingVolume)}
          </p>
          <p className="mt-2 text-xs text-slate-500 font-mono tabular-nums">
            {activeListings.length} available · {avgDom} avg days listed
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Projected Brokerage Fee</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {formatCompactCurrency(projectedBrokerage)}
          </p>
          <p className="mt-2 text-xs text-slate-500 font-mono tabular-nums">
            {settings.defaultCommissionRate.toFixed(1)}% mandate · {settings.defaultAgentSplit}% split
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Token / Under Offer</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {formatCompactCurrency(pendingVolume)}
          </p>
          <p className="mt-2 text-xs text-slate-500 font-mono tabular-nums">
            {pendingListings.length} deals awaiting registration
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Qualified Buyer Pipeline</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {formatCompactCurrency(totalPipelineBudget)}
          </p>
          <p className="mt-2 text-xs text-slate-500 font-mono tabular-nums">
            {activeLeads.length} active enquiries & NRIs
          </p>
        </div>
      </section>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Featured Inventory */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 sm:px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-slate-900">Portfolio Snapshot</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Active mandates across luxury residences, villas, and Grade-A commercial
              </p>
            </div>
            <Link
              href="/listings"
              className={`inline-flex items-center gap-1 text-xs font-semibold ${accent.primaryText} hover:underline whitespace-nowrap shrink-0 min-h-[36px]`}
            >
              <span>All {listings.length}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {listings.slice(0, 5).map((listing) => (
              <Link
                key={listing.id}
                href={`/listings?selected=${listing.id}`}
                className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-slate-50 transition-colors"
              >
                <div className="relative w-14 h-11 sm:w-16 sm:h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                  <PropertyImage imageKey={listing.imageKey} alt={listing.title} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {listing.title}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {listing.city} · {listing.bhk > 0 ? `${listing.bhk} BHK` : listing.category} ·{' '}
                    <span className="font-mono tabular-nums">{listing.daysOnMarket}d</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
                    {formatCompactCurrency(listing.price)}
                  </p>
                  <p className={`text-xs font-medium mt-0.5 ${getStatusTextClass(listing.status)}`}>
                    {listing.status}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Right: Pipeline Funnel */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 sm:px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-slate-900">Enquiry & Site-Visit Funnel</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Active buyer & investor demand by deal stage
              </p>
            </div>
            <Link
              href="/leads"
              className={`inline-flex items-center gap-1 text-xs font-semibold ${accent.primaryText} hover:underline whitespace-nowrap shrink-0 min-h-[36px]`}
            >
              <span>Open CRM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 sm:p-5 space-y-5 flex-1">
            {stages.map((stage) => {
              const stageLeads = leads.filter((l) => l.stage === stage);
              const stageBudget = stageLeads.reduce((sum, l) => sum + l.budget, 0);
              const widthPct =
                totalPipelineBudget > 0
                  ? Math.max(8, Math.round((stageBudget / totalPipelineBudget) * 100))
                  : 0;

              return (
                <div key={stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="font-medium text-slate-800 truncate">
                      {stage}{' '}
                      <span className="text-slate-400 font-mono tabular-nums">
                        ({stageLeads.length})
                      </span>
                    </span>
                    <span className="font-mono tabular-nums font-medium text-slate-700 shrink-0">
                      {formatCompactCurrency(stageBudget)}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${accent.primaryBg}`}
                      style={{ width: `${stageLeads.length > 0 ? widthPct : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <p className="text-xs font-semibold text-slate-700">Priority WhatsApp Follow-Ups</p>
              {activeLeads.slice(0, 2).map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between gap-3 py-1.5 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{lead.name}</p>
                    <p className="text-slate-500 truncate">
                      {lead.intent} · {lead.stage} · {lead.lastContacted}
                    </p>
                  </div>
                  <Link
                    href="/leads"
                    className={`font-semibold ${accent.primaryText} hover:underline whitespace-nowrap shrink-0 py-1.5`}
                  >
                    Draft Reply
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Advisor Leaderboard & Commission Split Ledger */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900">
              Channel Advisor Roster & Fee Retention
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Financial-year closed deal value and retained house brokerage
            </p>
          </div>
          <Link
            href="/settings"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0 min-h-[36px] inline-flex items-center"
          >
            Manage Roster
          </Link>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100">
          {agents.map((agent) => {
            const estTotalFee =
              agent.closedVolumeYtd * (settings.defaultCommissionRate / 100);
            const houseFee = estTotalFee * ((100 - agent.splitPercent) / 100);

            return (
              <div key={agent.id} className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {agent.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{agent.role}</p>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-slate-600 shrink-0">
                    {agent.splitPercent}% / {100 - agent.splitPercent}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                  <div>
                    <p className="text-slate-400">Active Deals</p>
                    <p className="font-mono tabular-nums font-medium text-slate-800 mt-0.5">
                      {agent.activeDeals}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">FY Volume</p>
                    <p className="font-mono tabular-nums font-medium text-slate-900 mt-0.5">
                      {formatCompactCurrency(agent.closedVolumeYtd)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400">House Fee</p>
                    <p className="font-mono tabular-nums font-semibold text-emerald-700 mt-0.5">
                      {formatCompactCurrency(houseFee)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Ledger Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                <th className="py-3 px-5">Advisor</th>
                <th className="py-3 px-4">Desk / Specialty</th>
                <th className="py-3 px-4 text-right">Advisor Split</th>
                <th className="py-3 px-4 text-right">Active Deals</th>
                <th className="py-3 px-4 text-right">FY Closed Volume</th>
                <th className="py-3 px-5 text-right">Est. House Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {agents.map((agent) => {
                const estTotalFee =
                  agent.closedVolumeYtd * (settings.defaultCommissionRate / 100);
                const houseFee = estTotalFee * ((100 - agent.splitPercent) / 100);

                return (
                  <tr key={agent.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-5 font-medium text-slate-900 whitespace-nowrap">
                      {agent.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {agent.role}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                      {agent.splitPercent}% / {100 - agent.splitPercent}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                      {agent.activeDeals}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-slate-900">
                      {formatCompactCurrency(agent.closedVolumeYtd)}
                    </td>
                    <td className="py-3 px-5 text-right font-mono tabular-nums font-semibold text-emerald-700">
                      {formatCompactCurrency(houseFee)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
