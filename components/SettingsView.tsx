'use client';

import React, { useState } from 'react';
import { Check, Download, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useBrokerage } from './BrokerageProvider';
import { ACCENT_THEMES, formatCompactCurrency } from '@/lib/format';
import { AccentTheme } from '@/lib/types';

export function SettingsView() {
  const {
    settings,
    agents,
    listings,
    leads,
    accent,
    updateSettings,
    addAgent,
    removeAgent,
    resetDemoData,
  } = useBrokerage();

  const [savedNotice, setSavedNotice] = useState(false);

  // Add Agent State
  const [agentName, setAgentName] = useState('');
  const [agentRole, setAgentRole] = useState('Senior Property Advisor');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentSplit, setAgentSplit] = useState('70');

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim()) return;
    addAgent({
      name: agentName.trim(),
      role: agentRole.trim() || 'Property Advisor',
      email: agentEmail.trim() || 'advisor@agency.in',
      splitPercent: Math.min(95, Math.max(40, Number(agentSplit) || 70)),
      closedVolumeYtd: 0,
      activeDeals: 0,
    });
    setAgentName('');
    setAgentEmail('');
  };

  const handleExportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      settings,
      agents,
      listings,
      leads,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${settings.brokerageName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* White-Label Brokerage Branding */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Agency Identity & RERA White-Label Setup
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Changes apply instantaneously across the sidebar, printed client sheets, and
              AI portal/WhatsApp copy
            </p>
          </div>

          <form onSubmit={handleSaveBranding} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Brokerage / Channel Partner Name
                </label>
                <input
                  type="text"
                  value={settings.brokerageName}
                  onChange={(e) => updateSettings({ brokerageName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Operating Cities / Micro-Markets
                </label>
                <input
                  type="text"
                  value={settings.marketRegion}
                  onChange={(e) => updateSettings({ marketRegion: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Principal Partner / Director
                </label>
                <input
                  type="text"
                  value={settings.managingBroker}
                  onChange={(e) => updateSettings({ managingBroker: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  RERA Agent / Brokerage Reg. No.
                </label>
                <input
                  type="text"
                  value={settings.reraNumber}
                  onChange={(e) => updateSettings({ reraNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Standard Brokerage Fee (%)
                </label>
                <input
                  type="number"
                  step={0.25}
                  min={0.5}
                  max={6}
                  value={settings.defaultCommissionRate}
                  onChange={(e) =>
                    updateSettings({
                      defaultCommissionRate: Number(e.target.value) || 2,
                    })
                  }
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Default Advisor Split (%)
                </label>
                <input
                  type="number"
                  min={40}
                  max={95}
                  value={settings.defaultAgentSplit}
                  onChange={(e) =>
                    updateSettings({
                      defaultAgentSplit: Number(e.target.value) || 70,
                    })
                  }
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Brand Accent Color
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {Object.values(AccentTheme).map((themeKey) => {
                  const token = ACCENT_THEMES[themeKey];
                  const active = settings.accentTheme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      type="button"
                      onClick={() => updateSettings({ accentTheme: themeKey })}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-xs font-medium transition-colors min-h-[44px] ${
                        active
                          ? 'border-slate-900 bg-slate-50 text-slate-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: token.swatch }}
                      />
                      <span className="truncate">{token.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {savedNotice && (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>White-label configuration saved locally</span>
                  </span>
                )}
              </div>

              <button
                type="submit"
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors min-h-[44px] ${accent.primaryBg} ${accent.primaryHover}`}
              >
                Save Branding
              </button>
            </div>
          </form>
        </section>

        {/* Client Handover & Backup Controls */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Data Export & Demo Reset
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Download a portable JSON snapshot of properties, enquiries, and advisor
                roster or reset sample data
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>RERA Inventory Records</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {listings.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>CRM Enquiry Records</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {leads.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Configured Advisors</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {agents.length}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleExportJson}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              <span>Export Brokerage JSON Backup</span>
            </button>

            <button
              type="button"
              onClick={resetDemoData}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors min-h-[44px]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restore Default Indian Sample</span>
            </button>
          </div>
        </section>
      </div>

      {/* Advisor Roster Management */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">Channel Advisor Roster</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Add or remove brokerage advisors assigned to property mandates and buyer leads
          </p>
        </div>

        {/* Mobile Advisor Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {agents.map((agent) => (
            <div key={agent.id} className="p-4 flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {agent.name}
                </p>
                <p className="text-xs text-slate-600 truncate">{agent.role}</p>
                <p className="text-xs text-slate-500 truncate">{agent.email}</p>
                <p className="text-xs font-mono tabular-nums text-slate-700 pt-0.5">
                  Split: {agent.splitPercent}% · FY: {formatCompactCurrency(agent.closedVolumeYtd)}
                </p>
              </div>
              <button
                type="button"
                disabled={agents.length <= 1}
                onClick={() => removeAgent(agent.id)}
                aria-label={`Remove ${agent.name}`}
                className="inline-flex items-center justify-center w-11 h-11 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Desktop Advisor Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-4">Desk / Role</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-right">Split</th>
                <th className="py-3 px-4 text-right">FY Volume</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-6 font-semibold text-slate-900 whitespace-nowrap">
                    {agent.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    {agent.role}
                  </td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    {agent.email}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                    {agent.splitPercent}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900">
                    {formatCompactCurrency(agent.closedVolumeYtd)}
                  </td>
                  <td className="py-3 px-6 text-right">
                    <button
                      type="button"
                      disabled={agents.length <= 1}
                      onClick={() => removeAgent(agent.id)}
                      aria-label={`Remove ${agent.name}`}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form
          onSubmit={handleAddAgent}
          className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
        >
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Advisor Name
            </label>
            <input
              required
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Rohan Verma"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg min-h-[44px]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Desk / Specialty
            </label>
            <input
              type="text"
              value={agentRole}
              onChange={(e) => setAgentRole(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg min-h-[44px]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Work Email
            </label>
            <input
              type="email"
              value={agentEmail}
              onChange={(e) => setAgentEmail(e.target.value)}
              placeholder="rohan@agency.in"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg min-h-[44px]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Advisor Split (%)
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={40}
              max={95}
              value={agentSplit}
              onChange={(e) => setAgentSplit(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-200 rounded-lg min-h-[44px]"
            />
          </div>
          <button
            type="submit"
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg min-h-[44px] ${accent.primaryBg} ${accent.primaryHover}`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Advisor</span>
          </button>
        </form>
      </section>
    </div>
  );
}
