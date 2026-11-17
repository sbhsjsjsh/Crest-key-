'use client';

import React, { useMemo, useState } from 'react';
import {
  Check,
  ChevronRight,
  Copy,
  MessageSquare,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useBrokerage } from './BrokerageProvider';
import { formatCompactCurrency } from '@/lib/format';
import {
  ClientLead,
  LeadIntent,
  LeadStage,
  OutreachDraftResult,
} from '@/lib/types';

const STAGE_ORDER: LeadStage[] = [
  LeadStage.NEW,
  LeadStage.TOURING,
  LeadStage.OFFER,
  LeadStage.CONTRACT,
  LeadStage.CLOSED,
];

export function LeadsView({ initialNew = false }: { initialNew?: boolean }) {
  const { settings, leads, listings, agents, accent, addLead, updateLeadStage, deleteLead } =
    useBrokerage();

  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [intentFilter, setIntentFilter] = useState<'All' | LeadIntent>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(initialNew);

  // Outreach Drawer
  const [activeLead, setActiveLead] = useState<ClientLead | null>(null);
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [outreachError, setOutreachError] = useState<string | null>(null);
  const [outreachResult, setOutreachResult] = useState<OutreachDraftResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // New Lead Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [intent, setIntent] = useState<LeadIntent>(LeadIntent.BUYER);
  const [budget, setBudget] = useState('25000000');
  const [source, setSource] = useState('99acres / Referral');
  const [matchedListingId, setMatchedListingId] = useState('');
  const [assignedAgentId, setAssignedAgentId] = useState(agents[0]?.id ?? 'ag-1');
  const [notes, setNotes] = useState('');

  const filteredLeads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesIntent = intentFilter === 'All' || lead.intent === intentFilter;
      const matchesQuery =
        !q ||
        lead.name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.source.toLowerCase().includes(q) ||
        lead.notes.toLowerCase().includes(q);
      return matchesIntent && matchesQuery;
    });
  }, [leads, intentFilter, searchQuery]);

  const getAgentName = (id: string) =>
    agents.find((a) => a.id === id)?.name ?? 'Assigned Advisor';

  const getListingById = (id?: string) =>
    id ? listings.find((l) => l.id === id) : undefined;

  const advanceStage = (lead: ClientLead) => {
    const idx = STAGE_ORDER.indexOf(lead.stage);
    if (idx >= 0 && idx < STAGE_ORDER.length - 1) {
      updateLeadStage(lead.id, STAGE_ORDER[idx + 1]);
    }
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addLead({
      name: name.trim(),
      email: email.trim() || 'client@domain.in',
      phone: phone.trim() || '+91 98200 12345',
      intent,
      stage: LeadStage.NEW,
      budget: Math.max(10_00_000, Number(budget) || 1_50_00_000),
      source: source.trim() || 'Direct Referral',
      assignedAgentId: assignedAgentId || agents[0]?.id || 'ag-1',
      matchedListingId: matchedListingId || undefined,
      lastContacted: 'Just added',
      notes: notes.trim() || 'Initial site visit consultation scheduled.',
    });

    setShowAddModal(false);
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setMatchedListingId('');
  };

  const handleDraftOutreach = async (lead: ClientLead) => {
    setActiveLead(lead);
    setOutreachResult(null);
    setOutreachError(null);
    setOutreachLoading(true);

    const matched = getListingById(lead.matchedListingId);
    const agent = agents.find((a) => a.id === lead.assignedAgentId);

    try {
      const res = await fetch('/api/ai/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brokerageName: settings.brokerageName,
          agentName: agent?.name ?? settings.managingBroker,
          clientName: lead.name,
          intent: lead.intent,
          stage: lead.stage,
          budget: lead.budget,
          notes: lead.notes,
          matchedPropertyTitle: matched?.title,
          matchedPropertyAddress: matched?.address,
          matchedPropertyPrice: matched?.price,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate follow-up draft.');
      }
      setOutreachResult(data as OutreachDraftResult);
    } catch (err: unknown) {
      setOutreachError(
        err instanceof Error ? err.message : 'Unable to generate client follow-up.'
      );
    } finally {
      setOutreachLoading(false);
    }
  };

  const copyText = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(key);
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <div className="space-y-6">
      {/* CRM Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search client, portal source, or notes..."
              aria-label="Search clients"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 min-h-[40px]"
            />
          </div>

          <div
            role="tablist"
            aria-label="Filter leads by intent"
            className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full"
          >
            {(
              [
                'All',
                LeadIntent.BUYER,
                LeadIntent.SELLER,
                LeadIntent.INVESTOR,
              ] as const
            ).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={intentFilter === item}
                onClick={() => setIntentFilter(item)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[40px] sm:min-h-[34px] ${
                  intentFilter === item
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap min-h-[38px] sm:min-h-[34px] ${
                viewMode === 'board'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Board
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap min-h-[38px] sm:min-h-[34px] ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ledger
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[44px] ${accent.primaryBg} ${accent.primaryHover}`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Enquiry</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
          <p className="text-base font-semibold text-slate-900">
            No matching client enquiries
          </p>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Add a buyer, seller mandate, or NRI investor enquiry to track site visits and
            draft personalized WhatsApp follow-ups.
          </p>
          <button
            type="button"
            onClick={() => {
              setIntentFilter('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'board' ? (
        /* Kanban Pipeline Board */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-start">
          {STAGE_ORDER.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stage);
            const stageTotal = stageLeads.reduce((sum, l) => sum + l.budget, 0);

            return (
              <section
                key={stage}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col"
              >
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-800 truncate">{stage}</h3>
                  <span className="text-xs font-mono tabular-nums text-slate-500 shrink-0">
                    {stageLeads.length} · {formatCompactCurrency(stageTotal)}
                  </span>
                </div>

                <div className="p-3 space-y-3 min-h-[160px]">
                  {stageLeads.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">
                      No clients in stage
                    </p>
                  ) : (
                    stageLeads.map((lead) => {
                      const matched = getListingById(lead.matchedListingId);
                      const isFinalStage = lead.stage === LeadStage.CLOSED;

                      return (
                        <div
                          key={lead.id}
                          className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2.5 hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {lead.name}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {lead.intent} ·{' '}
                                <span className="font-mono tabular-nums font-medium text-slate-700">
                                  {formatCompactCurrency(lead.budget)}
                                </span>
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteLead(lead.id)}
                              aria-label={`Remove ${lead.name}`}
                              className="text-slate-400 hover:text-red-600 p-1 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {matched && (
                            <p className="text-xs text-slate-600 truncate">
                              Matched: {matched.title}
                            </p>
                          )}

                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {lead.notes}
                          </p>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => handleDraftOutreach(lead)}
                              className={`inline-flex items-center gap-1.5 text-xs font-semibold ${accent.primaryText} hover:underline whitespace-nowrap min-h-[44px] sm:min-h-[32px]`}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp AI</span>
                            </button>

                            {!isFinalStage && (
                              <button
                                type="button"
                                onClick={() => advanceStage(lead)}
                                className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap min-h-[44px] sm:min-h-[32px]"
                              >
                                <span>Advance</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        /* High-Density Table View (Responsive Mobile Cards + Desktop Table) */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="md:hidden divide-y divide-slate-100">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {lead.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {lead.intent} · {lead.phone} · {lead.source}
                    </p>
                  </div>
                  <span className="text-sm font-mono tabular-nums font-semibold text-slate-900 shrink-0">
                    {formatCompactCurrency(lead.budget)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <select
                    value={lead.stage}
                    aria-label={`Stage for ${lead.name}`}
                    onChange={(e) =>
                      updateLeadStage(lead.id, e.target.value as LeadStage)
                    }
                    className="flex-1 px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-800 min-h-[40px]"
                  >
                    {STAGE_ORDER.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleDraftOutreach(lead)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 ${accent.primaryText} min-h-[40px] whitespace-nowrap`}
                  >
                    WhatsApp AI
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteLead(lead.id)}
                    aria-label={`Remove ${lead.name}`}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                  <th className="py-3 px-5">Client</th>
                  <th className="py-3 px-4">Intent</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4 text-right">Target Budget</th>
                  <th className="py-3 px-4">Advisor</th>
                  <th className="py-3 px-4">Last Contact</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-5">
                      <p className="font-semibold text-slate-900 whitespace-nowrap">
                        {lead.name}
                      </p>
                      <p className="text-xs text-slate-500 whitespace-nowrap">
                        {lead.phone} · {lead.source}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {lead.intent}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={lead.stage}
                        aria-label={`Stage for ${lead.name}`}
                        onChange={(e) =>
                          updateLeadStage(lead.id, e.target.value as LeadStage)
                        }
                        className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-md text-slate-800"
                      >
                        {STAGE_ORDER.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-slate-900 whitespace-nowrap">
                      {formatCompactCurrency(lead.budget)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {getAgentName(lead.assignedAgentId)}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {lead.lastContacted}
                    </td>
                    <td className="py-3 px-5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDraftOutreach(lead)}
                        className={`text-xs font-semibold ${accent.primaryText} hover:underline mr-3`}
                      >
                        WhatsApp AI
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteLead(lead.id)}
                        className="text-xs font-medium text-slate-400 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Follow-Up Modal */}
      <AnimatePresence>
        {activeLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setActiveLead(null)}
              className="fixed inset-0 bg-slate-900/40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">
                    {activeLead.intent} · {activeLead.stage}
                  </p>
                  <h3 className="text-base font-bold text-slate-900 truncate">
                    WhatsApp & Email Follow-Up for {activeLead.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveLead(null)}
                  aria-label="Close follow-up modal"
                  className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto">
                {outreachLoading && (
                  <div className="space-y-3 py-4">
                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                    <div className="h-20 bg-slate-100 rounded w-full" />
                    <div className="h-28 bg-slate-100 rounded w-full" />
                    <p className="text-xs text-slate-500 text-center">
                      Drafting personalized WhatsApp message and email follow-up...
                    </p>
                  </div>
                )}

                {outreachError && (
                  <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 space-y-2">
                    <p>{outreachError}</p>
                    <button
                      type="button"
                      onClick={() => handleDraftOutreach(activeLead)}
                      className="font-semibold underline"
                    >
                      Retry Generation
                    </button>
                  </div>
                )}

                {outreachResult && !outreachLoading && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">
                          WhatsApp Message Draft
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            copyText('whatsapp', outreachResult.whatsappDraft)
                          }
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                        >
                          {copiedField === 'whatsapp' ? (
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
                      <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                        {outreachResult.whatsappDraft}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">
                          Email Follow-Up
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            copyText(
                              'email',
                              `Subject: ${outreachResult.emailSubject}\n\n${outreachResult.emailBody}`
                            )
                          }
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                        >
                          {copiedField === 'email' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Email</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-slate-900">
                        Subject: {outreachResult.emailSubject}
                      </p>
                      <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                        {outreachResult.emailBody}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Lead Modal */}
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
                <h3 className="text-base font-bold text-slate-900">Add Client Enquiry</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  aria-label="Close modal"
                  className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateLead} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Client Full Name
                  </label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Aditya & Kavya Sharma"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aditya@company.in"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      WhatsApp / Mobile Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98200 12345"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Buyer / Mandate Type
                    </label>
                    <select
                      value={intent}
                      onChange={(e) => setIntent(e.target.value as LeadIntent)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                    >
                      {Object.values(LeadIntent).map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Budget (₹ INR)
                    </label>
                    <input
                      type="number"
                      min={1000000}
                      step={500000}
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Enquiry Source
                    </label>
                    <input
                      type="text"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="99acres / Magicbricks / Referral"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Assigned Advisor
                    </label>
                    <select
                      value={assignedAgentId}
                      onChange={(e) => setAssignedAgentId(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                    >
                      {agents.map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {ag.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Shortlisted Property (Optional)
                    </label>
                    <select
                      value={matchedListingId}
                      onChange={(e) => setMatchedListingId(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="">None selected</option>
                      {listings.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title} ({formatCompactCurrency(l.price)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Advisor Notes (Vastu, Home Loan, Site Visit Timing)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Prefers East-facing 3/4 BHK, weekend site visit, pre-approved HDFC home loan..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg min-h-[44px] ${accent.primaryBg} ${accent.primaryHover}`}
                  >
                    Save Enquiry
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
