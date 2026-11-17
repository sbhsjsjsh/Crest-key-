'use client';

import React, { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  FileText,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useBrokerage } from './BrokerageProvider';
import { PropertyImage } from './PropertyImage';
import { formatCompactCurrency, formatCurrency, formatNumber } from '@/lib/format';
import { IMAGE_KEY_OPTIONS } from '@/lib/property-images';
import {
  ListingStatus,
  MarketingCopyResult,
  PropertyCategory,
  PropertyListing,
} from '@/lib/types';

export function ListingsView({
  initialNew = false,
  initialSelectedId,
}: {
  initialNew?: boolean;
  initialSelectedId?: string;
}) {
  const { settings, listings, agents, accent, addListing, updateListingStatus, deleteListing } =
    useBrokerage();

  const [statusFilter, setStatusFilter] = useState<'All' | ListingStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<PropertyListing | null>(() =>
    initialSelectedId ? listings.find((l) => l.id === initialSelectedId) ?? null : null
  );
  const [showAddModal, setShowAddModal] = useState(initialNew);

  // AI Studio state
  const [tone, setTone] = useState('Luxury Indian Editorial');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<MarketingCopyResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New Listing form state
  const [formTitle, setFormTitle] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formReraCode, setFormReraCode] = useState('');
  const [formPrice, setFormPrice] = useState('24500000');
  const [formBhk, setFormBhk] = useState('3');
  const [formBaths, setFormBaths] = useState('3');
  const [formSqft, setFormSqft] = useState('1950');
  const [formCategory, setFormCategory] = useState<PropertyCategory>(
    PropertyCategory.APARTMENT
  );
  const [formImageKey, setFormImageKey] = useState('villa');
  const [formHighlights, setFormHighlights] = useState('');
  const [formAgentId, setFormAgentId] = useState(agents[0]?.id ?? 'ag-1');

  const filteredListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return listings.filter((item) => {
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.reraCode.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [listings, statusFilter, searchQuery]);

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAddress.trim()) return;

    const created = addListing({
      reraCode:
        formReraCode.trim() || `P519000${Math.floor(40000 + Math.random() * 50000)}`,
      title: formTitle.trim(),
      address: formAddress.trim(),
      city: formCity.trim() || 'Mumbai, Maharashtra',
      price: Math.max(10_00_000, Number(formPrice) || 1_50_00_000),
      bhk: Number(formBhk) || 0,
      baths: Number(formBaths) || 1,
      sqft: Math.max(300, Number(formSqft) || 1600),
      category: formCategory,
      status: ListingStatus.ACTIVE,
      daysOnMarket: 1,
      listingAgentId: formAgentId || agents[0]?.id || 'ag-1',
      imageKey: formImageKey,
      highlights:
        formHighlights.trim() ||
        'Vastu-compliant layout, Italian marble flooring, modular kitchen, 2 covered stilt parkings.',
      commissionRate: settings.defaultCommissionRate,
    });

    setShowAddModal(false);
    setFormTitle('');
    setFormAddress('');
    setFormCity('');
    setFormReraCode('');
    setFormHighlights('');
    setSelectedListing(created);
    setAiResult(null);
  };

  const handleGenerateCopy = async (listing: PropertyListing) => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brokerageName: settings.brokerageName,
          title: listing.title,
          address: listing.address,
          city: listing.city,
          price: listing.price,
          bhk: listing.bhk,
          baths: listing.baths,
          sqft: listing.sqft,
          category: listing.category,
          highlights: listing.highlights,
          reraCode: listing.reraCode,
          tone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate marketing kit.');
      }
      setAiResult(data as MarketingCopyResult);
    } catch (err: unknown) {
      setAiError(
        err instanceof Error ? err.message : 'Unable to generate listing marketing kit.'
      );
    } finally {
      setAiLoading(false);
    }
  };

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const getAgentName = (id: string) =>
    agents.find((a) => a.id === id)?.name ?? 'Assigned Advisor';

  return (
    <div className="space-y-6">
      {/* Toolbar: Search + Segmented Status Filter + Add Listing */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search locality, city, or RERA ID..."
              aria-label="Search listings"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 min-h-[40px]"
            />
          </div>

          <div
            role="tablist"
            aria-label="Filter listings by status"
            className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full"
          >
            {(
              [
                'All',
                ListingStatus.ACTIVE,
                ListingStatus.PENDING,
                ListingStatus.CLOSED,
              ] as const
            ).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={statusFilter === tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[40px] sm:min-h-[34px] ${
                  statusFilter === tab
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[44px] ${accent.primaryBg} ${accent.primaryHover}`}
        >
          <Plus className="w-4 h-4" />
          <span>Add Listing</span>
        </button>
      </div>

      {/* Property Grid */}
      {filteredListings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
          <p className="text-base font-semibold text-slate-900">
            No matching properties found
          </p>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Adjust your search filter or add a new RERA mandate to generate 99acres/Magicbricks
            copy and WhatsApp broadcasts.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredListings.map((listing) => {
            const ppsf = listing.sqft > 0 ? Math.round(listing.price / listing.sqft) : 0;

            return (
              <article
                key={listing.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:border-slate-300 transition-colors"
              >
                <div className="relative aspect-[4/3] w-full bg-slate-100">
                  <PropertyImage imageKey={listing.imageKey} alt={listing.title} />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2 text-white">
                    <span className="text-lg font-bold font-mono tabular-nums tracking-tight">
                      {formatCompactCurrency(listing.price)}
                    </span>
                    <span className="text-xs font-medium text-white/90 font-mono tabular-nums">
                      {formatCurrency(ppsf)}/sq.ft.
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="font-mono tabular-nums truncate">
                        RERA {listing.reraCode}
                      </span>
                      <span
                        className={`font-semibold whitespace-nowrap shrink-0 ${
                          listing.status === ListingStatus.ACTIVE
                            ? 'text-emerald-700'
                            : listing.status === ListingStatus.PENDING
                            ? 'text-amber-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {listing.status}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 leading-snug">
                      {listing.title}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {listing.address}, {listing.city}
                    </p>

                    <p className="pt-1 text-xs text-slate-500 font-mono tabular-nums">
                      {listing.bhk > 0 ? `${listing.bhk} BHK · ` : 'Commercial · '}
                      {listing.baths} ba · {formatNumber(listing.sqft)} sq.ft. ·{' '}
                      {listing.daysOnMarket}d listed
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500 truncate">
                      {getAgentName(listing.listingAgentId)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedListing(listing);
                        setAiResult(null);
                        setAiError(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-900 transition-colors whitespace-nowrap shrink-0 min-h-[44px] sm:min-h-[36px]"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Manage & AI Copy</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Property Slide-Over Drawer with AI Marketing Studio */}
      <AnimatePresence>
        {selectedListing && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={() => setSelectedListing(null)}
              className="fixed inset-0 bg-slate-900/40"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-xl bg-white h-[100dvh] overflow-y-auto border-l border-slate-200 shadow-2xl flex flex-col"
            >
              <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-mono text-slate-500 truncate">
                    RERA {selectedListing.reraCode} · {selectedListing.category}
                  </p>
                  <h3 className="text-base font-bold text-slate-900 truncate">
                    {selectedListing.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedListing(null)}
                  aria-label="Close property panel"
                  className="inline-flex items-center justify-center w-11 h-11 rounded-lg text-slate-500 hover:bg-slate-100 shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 flex-1">
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-slate-200">
                  <PropertyImage
                    imageKey={selectedListing.imageKey}
                    alt={selectedListing.title}
                  />
                </div>

                {/* Quick Status & Price Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200">
                  <div>
                    <p className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                      {formatCompactCurrency(selectedListing.price)}
                    </p>
                    <p className="text-xs text-slate-500 font-mono tabular-nums mt-0.5">
                      {formatCurrency(selectedListing.price)} · {selectedListing.address},{' '}
                      {selectedListing.city}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label htmlFor="drawer-status" className="sr-only">
                      Listing Status
                    </label>
                    <select
                      id="drawer-status"
                      value={selectedListing.status}
                      onChange={(e) => {
                        const next = e.target.value as ListingStatus;
                        updateListingStatus(selectedListing.id, next);
                        setSelectedListing({ ...selectedListing, status: next });
                      }}
                      className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 min-h-[40px]"
                    >
                      {Object.values(ListingStatus).map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        deleteListing(selectedListing.id);
                        setSelectedListing(null);
                      }}
                      aria-label="Delete listing"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-700">
                    Property Highlights & Vastu / Carpet Specs
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {selectedListing.highlights}
                  </p>
                </div>

                {/* AI Listing & Marketing Studio */}
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      AI Portal & WhatsApp Marketing Studio
                    </h4>
                    <p className="text-xs text-slate-500">
                      Draft 99acres/Magicbricks descriptions, WhatsApp CP forwards, and NRI
                      investor emails
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      aria-label="Marketing copy tone"
                      className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 min-h-[44px] flex-1"
                    >
                      <option value="Luxury Indian Editorial">Luxury Indian Editorial</option>
                      <option value="NRI & HNI Investor Brief">NRI & HNI Investor Brief</option>
                      <option value="Vastu & Family Lifestyle">Vastu & Family Lifestyle</option>
                      <option value="99acres / Magicbricks Portal">
                        99acres / Magicbricks Portal
                      </option>
                    </select>

                    <button
                      type="button"
                      disabled={aiLoading}
                      onClick={() => handleGenerateCopy(selectedListing)}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[44px] disabled:opacity-60 ${accent.primaryBg} ${accent.primaryHover}`}
                    >
                      {aiLoading ? 'Drafting Copy...' : 'Generate Marketing Kit'}
                    </button>
                  </div>

                  {aiError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                      {aiError}
                    </div>
                  )}

                  {aiResult && (
                    <div className="space-y-4 pt-2">
                      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700">
                            Property Portal Listing (99acres / Magicbricks)
                          </span>
                          <button
                            type="button"
                            onClick={() => copyText('portal', aiResult.portalDescription)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                          >
                            {copiedKey === 'portal' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                          {aiResult.portalDescription}
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700">
                            WhatsApp Broadcast (Buyers & Channel Partners)
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              copyText('whatsapp', aiResult.whatsappBroadcast)
                            }
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                          >
                            {copiedKey === 'whatsapp' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy WhatsApp</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                          {aiResult.whatsappBroadcast}
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700">
                            HNI / NRI Investor Email Invite
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              copyText(
                                'email',
                                `Subject: ${aiResult.emailSubject}\n\n${aiResult.emailBody}`
                              )
                            }
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                          >
                            {copiedKey === 'email' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs font-semibold text-slate-900">
                          Subject: {aiResult.emailSubject}
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                          {aiResult.emailBody}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add New Listing Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-slate-900/40"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  Add RERA Property Mandate
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  aria-label="Close modal"
                  className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateListing} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Property / Project Title
                  </label>
                  <input
                    required
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g., Koramangala 3rd Block Corner Residence"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Locality / Street
                    </label>
                    <input
                      required
                      type="text"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      placeholder="14th Main, Bandra West"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      City & State
                    </label>
                    <input
                      type="text"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      placeholder="Mumbai, Maharashtra"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    RERA Project Registration ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formReraCode}
                    onChange={(e) => setFormReraCode(e.target.value)}
                    placeholder="e.g., P51900048210"
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Price (₹ INR)
                    </label>
                    <input
                      type="number"
                      min={500000}
                      step={500000}
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      BHK
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formBhk}
                      onChange={(e) => setFormBhk(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Baths
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={1}
                      value={formBaths}
                      onChange={(e) => setFormBaths(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Area (sq.ft.)
                    </label>
                    <input
                      type="number"
                      min={300}
                      value={formSqft}
                      onChange={(e) => setFormSqft(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as PropertyCategory)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                    >
                      {Object.values(PropertyCategory).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Property Photo Style
                    </label>
                    <select
                      value={formImageKey}
                      onChange={(e) => setFormImageKey(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                    >
                      {IMAGE_KEY_OPTIONS.map((opt) => (
                        <option key={opt.key} value={opt.key}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Listing Advisor
                    </label>
                    <select
                      value={formAgentId}
                      onChange={(e) => setFormAgentId(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                    >
                      {agents.map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {ag.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Key Highlights (Vastu, OC, Parking, Carpet Area)
                  </label>
                  <textarea
                    rows={3}
                    value={formHighlights}
                    onChange={(e) => setFormHighlights(e.target.value)}
                    placeholder="East-facing Vastu entry, OC received, 2 stilt parkings, Italian marble..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors min-h-[44px] ${accent.primaryBg} ${accent.primaryHover}`}
                  >
                    Save Listing
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
