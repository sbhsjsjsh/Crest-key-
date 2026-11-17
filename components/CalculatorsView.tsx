'use client';

import React, { useMemo, useState } from 'react';
import { Check, Copy, Printer } from 'lucide-react';
import { useBrokerage } from './BrokerageProvider';
import { formatCompactCurrency, formatCurrency } from '@/lib/format';

const STATE_STAMP_PRESETS = [
  { label: 'Maharashtra (6% + ₹30K Reg)', stampPct: 6.0, regFixed: 30000 },
  { label: 'Karnataka (5.6% + 1% Reg)', stampPct: 6.6, regFixed: 0 },
  { label: 'Delhi NCR (6% + 1% Reg)', stampPct: 7.0, regFixed: 0 },
  { label: 'Telangana (7.5% All-In)', stampPct: 7.5, regFixed: 0 },
];

export function CalculatorsView() {
  const { settings, accent } = useBrokerage();
  const [activeTab, setActiveTab] = useState<'net-sheet' | 'emi-yield'>('net-sheet');
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Seller Net Sheet, Sec 194-IA TDS & Channel Partner Split State
  const [salePrice, setSalePrice] = useState(4_50_00_000); // ₹4.50 Cr
  const [loanForeclosure, setLoanForeclosure] = useState(1_20_00_000); // ₹1.20 Cr
  const [brokeragePct, setBrokeragePct] = useState(settings.defaultCommissionRate);
  const [gstOnBrokerage, setGstOnBrokerage] = useState(true);
  const [societyNocAndLegal, setSocietyNocAndLegal] = useState(1_50_000);
  const [agentSplitPct, setAgentSplitPct] = useState(settings.defaultAgentSplit);

  // Home Loan EMI, Stamp Duty & Rental Yield State
  const [purchasePrice, setPurchasePrice] = useState(2_50_00_000); // ₹2.50 Cr
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTermYears, setLoanTermYears] = useState(20);
  const [stampDutyPct, setStampDutyPct] = useState(6.0);
  const [registrationFee, setRegistrationFee] = useState(30_000);
  const [monthlyGrossRent, setMonthlyGrossRent] = useState(95_000);
  const [monthlySocietyMaint, setMonthlySocietyMaint] = useState(12_000);
  const [annualPropertyTax, setAnnualPropertyTax] = useState(42_000);

  const netSheet = useMemo(() => {
    const baseBrokerage = salePrice * (brokeragePct / 100);
    const gstAmount = gstOnBrokerage ? baseBrokerage * 0.18 : 0;
    const totalBrokeragePayable = baseBrokerage + gstAmount;

    // Sec 194-IA: 1% TDS applies on consideration >= ₹50,00,000
    const tdsSection194Ia = salePrice >= 50_00_000 ? salePrice * 0.01 : 0;

    const totalDeductions =
      loanForeclosure + totalBrokeragePayable + tdsSection194Ia + societyNocAndLegal;
    const sellerNetProceeds = Math.max(0, salePrice - totalDeductions);

    const advisorPayout = baseBrokerage * (agentSplitPct / 100);
    const houseRetained = baseBrokerage - advisorPayout;
    const netRatio = salePrice > 0 ? (sellerNetProceeds / salePrice) * 100 : 0;

    return {
      baseBrokerage,
      gstAmount,
      totalBrokeragePayable,
      tdsSection194Ia,
      sellerNetProceeds,
      advisorPayout,
      houseRetained,
      netRatio,
    };
  }, [
    salePrice,
    loanForeclosure,
    brokeragePct,
    gstOnBrokerage,
    societyNocAndLegal,
    agentSplitPct,
  ]);

  const emiYield = useMemo(() => {
    const downPaymentAmount = purchasePrice * (downPaymentPct / 100);
    const loanAmount = Math.max(0, purchasePrice - downPaymentAmount);
    const stampDutyAmount = purchasePrice * (stampDutyPct / 100);
    const totalGovtCharges = stampDutyAmount + registrationFee;
    const totalUpfrontCash = downPaymentAmount + totalGovtCharges;

    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTermYears * 12;

    let monthlyEmi = 0;
    if (loanAmount > 0 && monthlyRate > 0) {
      const factor = Math.pow(1 + monthlyRate, totalMonths);
      monthlyEmi = (loanAmount * (monthlyRate * factor)) / (factor - 1);
    } else if (loanAmount > 0) {
      monthlyEmi = loanAmount / totalMonths;
    }

    const annualGrossRent = monthlyGrossRent * 12;
    const annualExpenses = monthlySocietyMaint * 12 + annualPropertyTax;
    const noi = annualGrossRent - annualExpenses;

    const grossYieldPct = purchasePrice > 0 ? (annualGrossRent / purchasePrice) * 100 : 0;
    const netYieldPct = purchasePrice > 0 ? (noi / purchasePrice) * 100 : 0;
    const monthlyOutflowWithMaint = monthlyEmi + monthlySocietyMaint;

    return {
      downPaymentAmount,
      loanAmount,
      stampDutyAmount,
      totalGovtCharges,
      totalUpfrontCash,
      monthlyEmi,
      monthlyOutflowWithMaint,
      noi,
      grossYieldPct,
      netYieldPct,
    };
  }, [
    purchasePrice,
    downPaymentPct,
    interestRate,
    loanTermYears,
    stampDutyPct,
    registrationFee,
    monthlyGrossRent,
    monthlySocietyMaint,
    annualPropertyTax,
  ]);

  const handleCopySummary = async () => {
    const text =
      activeTab === 'net-sheet'
        ? `${settings.brokerageName} (RERA: ${settings.reraNumber}) — Seller Net Sheet
Agreement Value: ${formatCurrency(salePrice)} (${formatCompactCurrency(salePrice)})
Home Loan Foreclosure: ${formatCurrency(loanForeclosure)}
1% TDS (Sec 194-IA): ${formatCurrency(netSheet.tdsSection194Ia)}
Brokerage (${brokeragePct.toFixed(1)}%${gstOnBrokerage ? ' + 18% GST' : ''}): ${formatCurrency(
            netSheet.totalBrokeragePayable
          )}
Society NOC & Legal: ${formatCurrency(societyNocAndLegal)}
Estimated Net Seller Proceeds: ${formatCurrency(netSheet.sellerNetProceeds)} (${formatCompactCurrency(
            netSheet.sellerNetProceeds
          )})`
        : `${settings.brokerageName} (RERA: ${settings.reraNumber}) — Buyer EMI & Yield Sheet
Property Value: ${formatCurrency(purchasePrice)} (${formatCompactCurrency(purchasePrice)})
Down Payment (${downPaymentPct}%): ${formatCurrency(emiYield.downPaymentAmount)}
Stamp Duty & Registration: ${formatCurrency(emiYield.totalGovtCharges)}
Total Upfront Capital Needed: ${formatCurrency(emiYield.totalUpfrontCash)}
Monthly Home Loan EMI (${interestRate}% for ${loanTermYears} yrs): ${formatCurrency(
            emiYield.monthlyEmi
          )}
Gross / Net Rental Yield: ${emiYield.grossYieldPct.toFixed(2)}% / ${emiYield.netYieldPct.toFixed(
            2
          )}%`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <div className="space-y-6">
      {/* Segmented Calculator Mode Bar + Export */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 no-print">
        <div
          role="tablist"
          aria-label="Calculator mode"
          className="grid grid-cols-2 sm:inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full md:w-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'net-sheet'}
            onClick={() => setActiveTab('net-sheet')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap min-h-[42px] sm:min-h-[38px] text-center ${
              activeTab === 'net-sheet'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="sm:hidden">Net Sheet & TDS</span>
            <span className="hidden sm:inline">Seller Net Sheet & Sec 194-IA TDS</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'emi-yield'}
            onClick={() => setActiveTab('emi-yield')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap min-h-[42px] sm:min-h-[38px] text-center ${
              activeTab === 'emi-yield'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="sm:hidden">EMI & Stamp Duty</span>
            <span className="hidden sm:inline">Home Loan EMI, Stamp Duty & Yield</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap min-h-[44px] sm:min-h-[40px]"
          >
            {copiedSummary ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 shrink-0" />
                <span>Copy WhatsApp</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white rounded-lg transition-colors whitespace-nowrap min-h-[44px] sm:min-h-[40px] ${accent.primaryBg} ${accent.primaryHover}`}
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {activeTab === 'net-sheet' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs */}
          <section className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Resale Transaction & Brokerage Assumptions
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Includes mandatory 1% TDS (Sec 194-IA) on properties ₹50 Lakh & above, GST
                toggle, and advisor split
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Agreement Sale Value (₹)
                </label>
                <input
                  type="number"
                  step={500000}
                  min={0}
                  value={salePrice}
                  onChange={(e) => setSalePrice(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg"
                />
                <p className="text-xs text-slate-400 font-mono mt-1">
                  {formatCompactCurrency(salePrice)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Home Loan Foreclosure (₹)
                </label>
                <input
                  type="number"
                  step={100000}
                  min={0}
                  value={loanForeclosure}
                  onChange={(e) => setLoanForeclosure(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg"
                />
                <p className="text-xs text-slate-400 font-mono mt-1">
                  {formatCompactCurrency(loanForeclosure)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Seller-Side Brokerage (%)
                </label>
                <input
                  type="number"
                  step={0.25}
                  min={0}
                  max={6}
                  value={brokeragePct}
                  onChange={(e) => setBrokeragePct(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Society NOC, Transfer & Legal (₹)
                </label>
                <input
                  type="number"
                  step={10000}
                  min={0}
                  value={societyNocAndLegal}
                  onChange={(e) => setSocietyNocAndLegal(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border border-slate-200">
              <label htmlFor="gst-toggle" className="text-xs font-medium text-slate-700">
                Include 18% GST on Brokerage Fee
              </label>
              <input
                id="gst-toggle"
                type="checkbox"
                checked={gstOnBrokerage}
                onChange={(e) => setGstOnBrokerage(e.target.checked)}
                className="w-4 h-4 accent-slate-900"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-medium text-slate-700">
                  Channel Partner / Advisor Split
                </span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {agentSplitPct}% Advisor / {100 - agentSplitPct}% {settings.brokerageName}
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={95}
                step={5}
                value={agentSplitPct}
                onChange={(e) => setAgentSplitPct(Number(e.target.value))}
                aria-label="Advisor split percentage"
                className="w-full accent-slate-900"
              />
            </div>
          </section>

          {/* Outputs */}
          <section className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-200">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  {settings.brokerageName} · Net Seller Proceeds
                </p>
                <p className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                  {formatCompactCurrency(netSheet.sellerNetProceeds)}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
                  {formatCurrency(netSheet.sellerNetProceeds)} ({netSheet.netRatio.toFixed(1)}%
                  of agreement value)
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600">Gross Agreement Value</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {formatCurrency(salePrice)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600">Less Existing Home Loan Foreclosure</span>
                <span className="font-mono tabular-nums text-slate-700">
                  -{formatCurrency(loanForeclosure)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600">
                  Less 1% TDS u/s 194-IA {salePrice >= 50_00_000 ? '(Applicable)' : '(Exempt < ₹50L)'}
                </span>
                <span className="font-mono tabular-nums text-slate-700">
                  -{formatCurrency(netSheet.tdsSection194Ia)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600">
                  Less Brokerage ({brokeragePct.toFixed(1)}%
                  {gstOnBrokerage ? ' + 18% GST' : ''})
                </span>
                <span className="font-mono tabular-nums text-slate-700">
                  -{formatCurrency(netSheet.totalBrokeragePayable)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600">Less Society NOC & Legal Fees</span>
                <span className="font-mono tabular-nums text-slate-700">
                  -{formatCurrency(societyNocAndLegal)}
                </span>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-700">
                Internal Brokerage Retention (Excl. GST)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500">Base Brokerage</p>
                  <p className="text-base font-bold font-mono tabular-nums text-slate-900 mt-1">
                    {formatCompactCurrency(netSheet.baseBrokerage)}
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500">Advisor ({agentSplitPct}%)</p>
                  <p className="text-base font-bold font-mono tabular-nums text-slate-900 mt-1">
                    {formatCompactCurrency(netSheet.advisorPayout)}
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500">
                    House ({100 - agentSplitPct}%)
                  </p>
                  <p className="text-base font-bold font-mono tabular-nums text-emerald-700 mt-1">
                    {formatCompactCurrency(netSheet.houseRetained)}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Buyer Home Loan & Stamp Duty Inputs */}
          <section className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Home Loan EMI, Stamp Duty & Rental Yield
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculate upfront stamp duty outlay, bank EMI, and net rental yield for
                buyers and NRI investors
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {STATE_STAMP_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setStampDutyPct(preset.stampPct);
                    setRegistrationFee(preset.regFixed);
                  }}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Property Consideration Value (₹)
                </label>
                <input
                  type="number"
                  step={500000}
                  min={0}
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg"
                />
                <p className="text-xs text-slate-400 font-mono mt-1">
                  {formatCompactCurrency(purchasePrice)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Own Contribution / Down Payment (%)
                </label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={downPaymentPct}
                  onChange={(e) => setDownPaymentPct(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Home Loan Rate (% p.a.)
                </label>
                <input
                  type="number"
                  step={0.1}
                  min={5}
                  max={15}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Loan Tenure (Years)
                </label>
                <select
                  value={loanTermYears}
                  onChange={(e) => setLoanTermYears(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg bg-white"
                >
                  <option value={25}>25 Years</option>
                  <option value={20}>20 Years</option>
                  <option value={15}>15 Years</option>
                  <option value={10}>10 Years</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Stamp Duty (%)
                </label>
                <input
                  type="number"
                  step={0.1}
                  min={0}
                  max={12}
                  value={stampDutyPct}
                  onChange={(e) => setStampDutyPct(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Registration Cap / Fee (₹)
                </label>
                <input
                  type="number"
                  step={5000}
                  min={0}
                  value={registrationFee}
                  onChange={(e) => setRegistrationFee(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Expected Monthly Rent (₹)
                </label>
                <input
                  type="number"
                  step={5000}
                  min={0}
                  value={monthlyGrossRent}
                  onChange={(e) => setMonthlyGrossRent(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Society Maintenance / mo & Annual Tax (₹)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={0}
                    value={monthlySocietyMaint}
                    onChange={(e) => setMonthlySocietyMaint(Number(e.target.value) || 0)}
                    aria-label="Monthly society maintenance"
                    className="w-full px-2.5 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg"
                  />
                  <input
                    type="number"
                    min={0}
                    value={annualPropertyTax}
                    onChange={(e) => setAnnualPropertyTax(Number(e.target.value) || 0)}
                    aria-label="Annual municipal property tax"
                    className="w-full px-2.5 py-2 text-sm font-mono tabular-nums border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Buyer Outputs */}
          <section className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div className="pb-5 border-b border-slate-200">
              <p className="text-xs font-medium text-slate-500">
                Estimated Monthly Home Loan EMI
              </p>
              <p className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                {formatCurrency(emiYield.monthlyEmi)}
                <span className="text-sm font-normal text-slate-500"> / mo</span>
              </p>
              <p className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
                Sanctioned Loan: {formatCompactCurrency(emiYield.loanAmount)} · EMI + Society:{' '}
                {formatCurrency(emiYield.monthlyOutflowWithMaint)} / mo
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500">Stamp Duty & Registration</p>
                <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                  {formatCompactCurrency(emiYield.totalGovtCharges)}
                </p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {formatCurrency(emiYield.totalGovtCharges)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500">Total Upfront Capital Needed</p>
                <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                  {formatCompactCurrency(emiYield.totalUpfrontCash)}
                </p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Down payment + govt. charges
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500">Gross / Net Rental Yield</p>
                <p className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
                  {emiYield.grossYieldPct.toFixed(2)}% / {emiYield.netYieldPct.toFixed(2)}%
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500">Net Annual Rental Income (NOI)</p>
                <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                  {formatCompactCurrency(emiYield.noi)}
                  <span className="text-xs font-normal text-slate-500"> / yr</span>
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
