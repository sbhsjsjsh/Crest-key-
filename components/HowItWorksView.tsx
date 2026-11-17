'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Calculator,
  Download,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { useBrokerage } from './BrokerageProvider';

type GuideLang = 'hinglish' | 'english';

interface StepGuide {
  number: string;
  route: string;
  routeLabelEn: string;
  routeLabelHi: string;
  icon: React.ComponentType<{ className?: string }>;
  titleEn: string;
  titleHi: string;
  summaryEn: string;
  summaryHi: string;
  stepsEn: string[];
  stepsHi: string[];
}

const WORKFLOW_STEPS: StepGuide[] = [
  {
    number: '01',
    route: '/settings',
    routeLabelEn: 'Open White-Label Setup',
    routeLabelHi: 'White-Label Setup Kholiye',
    icon: SlidersHorizontal,
    titleEn: 'Brand the Software for Any Real Estate Agency',
    titleHi: 'Step 1: Kisi Bhi Real Estate Company Ke Naam Par Software Set Karein',
    summaryEn:
      'Before demoing to a client or handing over the platform, replace the agency name, city micro-markets, RERA number, and advisor commission splits in seconds.',
    summaryHi:
      'Client ko demo dene ya software handover karne se pehle, sirf 30 second mein unki company ka naam, RERA number, city aur brand color set kar sakte hain.',
    stepsEn: [
      'Open White-Label (/settings) from the sidebar or mobile menu.',
      'Enter the client’s Brokerage Name (e.g., Oberoi & Partners Realty), Operating Cities, Principal Partner name, and RERA Registration Number.',
      'Set their Standard Brokerage Fee % (typically 2.0% in India) and Default Advisor Split % (e.g., 70% advisor / 30% house).',
      'Pick a Brand Accent Color (Cobalt Navy, Forest Teal, Obsidian, or Saffron Bronze) and click Save Branding — every header, net sheet, and AI draft updates immediately.',
      'Scroll down to the Channel Advisor Roster to add or remove property advisors with their individual commission splits.',
    ],
    stepsHi: [
      'Sidebar ya mobile menu se White-Label (/settings) page kholiye.',
      'Brokerage Name mein real estate company ka naam, Operating Cities (jaise Mumbai, Bengaluru, NCR), Principal Partner ka naam aur RERA Registration Number daaliye.',
      'Standard Brokerage Fee % (India mein aam taur par 2.0%) aur Default Advisor Split % (jaise 70% advisor / 30% company) set karein.',
      'Apne client ke brand ke hisaab se Accent Color select karke "Save Branding" dabaiye — poora app, printed sheet aur AI messages turant unke naam par aa jayenge.',
      'Neeche Channel Advisor Roster mein company ke sabhi agents/advisors ka naam, email aur unka commission split add karein.',
    ],
  },
  {
    number: '02',
    route: '/listings',
    routeLabelEn: 'Open Property Portfolio',
    routeLabelHi: 'Listings Page Kholiye',
    icon: Building2,
    titleEn: 'Add RERA Listings & Generate Portal / WhatsApp Copy',
    titleHi: 'Step 2: RERA Properties Add Karein Aur AI Se 99acres / WhatsApp Copy Banayein',
    summaryEn:
      'Maintain a clean inventory of apartments, villas, penthouses, and commercial floorplates in ₹ Crores/Lakhs, then generate ready-to-post marketing copy.',
    summaryHi:
      'Apni sabhi flats, villas, penthouses aur commercial properties ko ₹ Cr/Lakh aur BHK details ke saath store karein aur ek click mein marketing content banayein.',
    stepsEn: [
      'Go to Listings (/listings) and click Add Listing in the top right.',
      'Fill in the Property Title, Locality, City, RERA Project ID, Asking Price in ₹ INR, BHK, Bathrooms, Area in sq.ft., and Vastu/OC highlights.',
      'Use the search box or status tabs (All, Available, Token / Under Offer, Registered / Sold) to filter inventory during client calls.',
      'Click Manage & AI Copy on any property card to open the side drawer.',
      'Inside the drawer, update the deal status anytime or choose a tone (e.g., Luxury Indian Editorial or NRI & HNI Investor Brief) and click Generate Marketing Kit.',
      'Copy the generated 99acres/Magicbricks description, WhatsApp Broadcast message, or HNI Email Invite in one click.',
    ],
    stepsHi: [
      'Listings (/listings) page par jaakar "Add Listing" button par click karein.',
      'Property Title, Locality, City, RERA ID, Price (₹ mein), BHK, Bathrooms, Area (sq.ft.) aur Vastu/Parking highlights bhar kar "Save Listing" karein.',
      'Search bar aur filter tabs (All, Available, Token / Under Offer, Registered / Sold) se kisi bhi property ko turant dhoondein.',
      'Kisi bhi property card par "Manage & AI Copy" dabakar side panel kholiye.',
      'Yahan se aap status change kar sakte hain, aur "Generate Marketing Kit" dabakar AI se 99acres/Magicbricks description, WhatsApp Broadcast message aur NRI email turant tayyar kar sakte hain.',
      'Har box ke upar "Copy" ya "Copy WhatsApp" button dabakar seedha apne WhatsApp group ya portal par paste karein.',
    ],
  },
  {
    number: '03',
    route: '/leads',
    routeLabelEn: 'Open Client CRM',
    routeLabelHi: 'Client CRM Kholiye',
    icon: Users,
    titleEn: 'Track Enquiries, Site Visits & Draft WhatsApp Replies',
    titleHi: 'Step 3: Buyer Leads, Site Visits Aur WhatsApp Follow-Up Manage Karein',
    summaryEn:
      'Never lose a buyer or NRI enquiry. Move clients from initial enquiry through site visits, token cheques, and registration.',
    summaryHi:
      'Har buyer, seller mandate aur NRI investor ko stage-by-stage track karein taaki koi bhi site visit ya token deal miss na ho.',
    stepsEn: [
      'Open Client CRM (/leads) and click Add Enquiry to log a new End-User Buyer, Seller Mandate, or NRI / Investor with their budget in ₹ INR and matched property.',
      'Switch between Board view (5 stages: New Enquiry → Site Visit Scheduled → Negotiation / Token → Agreement / Registration → Closed) and Ledger view.',
      'Click Advance on any board card (or change the dropdown in Ledger view) as the buyer progresses from site visit to token payment.',
      'Click WhatsApp AI on any lead card to automatically draft a polite, stage-aware WhatsApp follow-up and email referencing their matched property.',
    ],
    stepsHi: [
      'Client CRM (/leads) par jaakar "Add Enquiry" dabaiye aur client ka naam, WhatsApp number, budget (₹ mein), source (99acres/Magicbricks/Referral) aur pasand ki property select karein.',
      'Aap "Board" view (5 stages: New Enquiry → Site Visit Scheduled → Negotiation / Token → Agreement / Registration → Closed) ya "Ledger" view mein kaam kar sakte hain.',
      'Jaise hi buyer site visit kare ya token de, card par "Advance" dabakar use agli stage par move karein.',
      'Kisi bhi client ke card par "WhatsApp AI" button dabaiye — system unke stage aur matched property ke hisaab se turant polite WhatsApp message aur Email draft bana dega, jise aap 1 click mein copy karke bhej sakte hain.',
    ],
  },
  {
    number: '04',
    route: '/calculators',
    routeLabelEn: 'Open Deal & Tax Calculators',
    routeLabelHi: 'Calculators Kholiye',
    icon: Calculator,
    titleEn: 'Calculate Seller Net Sheet, Sec 194-IA TDS, Stamp Duty & EMI',
    titleHi: 'Step 4: Seller Net Sheet (1% TDS), Stamp Duty Aur Home Loan EMI Nikalein',
    summaryEn:
      'Close pricing objections on the spot during meetings with accurate Indian tax, GST, bank EMI, and state stamp-duty breakdowns.',
    summaryHi:
      'Client meeting mein baithe-baithe Seller ko haath mein kitna paisa milega aur Buyer ki monthly EMI + Stamp Duty kitni aayegi, turant calculate karein.',
    stepsEn: [
      'Choose Net Sheet & TDS in Calculators (/calculators) when sitting with a property seller.',
      'Enter Agreement Sale Value, Home Loan Foreclosure amount, Brokerage %, and toggle 18% GST on Brokerage. Properties ₹50 Lakh+ automatically deduct 1% TDS u/s 194-IA.',
      'Adjust the Advisor Split slider to see exact Advisor Payout vs. Brokerage Retained Revenue.',
      'Switch to EMI & Stamp Duty for buyers: pick a state preset (Maharashtra, Karnataka, Delhi NCR, Telangana), enter down payment %, interest rate, and expected monthly rent to view Monthly EMI, Total Upfront Capital, and Net Rental Yield %.',
      'Click Copy WhatsApp to share the summary in chat, or Print Sheet to save/print a clean branded PDF for the client.',
    ],
    stepsHi: [
      'Calculators (/calculators) page par Seller ke saath baithne par "Net Sheet & TDS" tab chunein.',
      'Agreement Value, Home Loan Foreclosure, Brokerage % aur Society NOC daaliye. ₹50 Lakh ya usse zyada ki property par 1% TDS (Sec 194-IA) apne aap calculate ho jayega. 18% GST toggle bhi kar sakte hain.',
      'Neeche slider se Advisor aur Company ka commission split turant dekh sakte hain.',
      'Buyer ya Investor ke liye "EMI & Stamp Duty" tab par click karein — Maharashtra, Karnataka, Delhi NCR ya Telangana ke quick presets dabakar Stamp Duty, Monthly Home Loan EMI, Total Upfront Capital aur Rental Yield % dekhein.',
      'Meeting ke baad "Copy WhatsApp" dabakar calculation chat par bhejein ya "Print Sheet" se client ke liye PDF print nikaalein.',
    ],
  },
  {
    number: '05',
    route: '/',
    routeLabelEn: 'Open Executive Overview',
    routeLabelHi: 'Dashboard Overview Dekhein',
    icon: Download,
    titleEn: 'Monitor Daily KPIs, Backups & Client Handover',
    titleHi: 'Step 5: Daily Brokerage Dashboard, Data Backup Aur Client Demo Reset',
    summaryEn:
      'Track total inventory value in Crores, projected brokerage revenue, pending token deals, and export client backups anytime.',
    summaryHi:
      'Main Overview (/) par poore office ka kaam ek nazar mein dekhein aur har client ke data ka safe backup rakhein.',
    stepsEn: [
      'Visit Overview (/) each morning to check Active & Token Inventory (₹ Cr), Projected Brokerage Fee, Deals Awaiting Registration, and the Enquiry Funnel.',
      'Review the Channel Advisor Roster table to see each advisor’s FY Closed Volume and estimated house fee retention.',
      'All changes save automatically in your browser. Use Export Brokerage JSON Backup on /settings to download a portable data file, or Restore Default Indian Sample before starting a fresh client demo.',
    ],
    stepsHi: [
      'Subah Overview (/) kholkar poore office ka Active Inventory (₹ Cr mein), Projected Brokerage Fee, Token Deals aur Buyer Funnel check karein.',
      'Neeche Channel Advisor Roster mein dekhein kis advisor ne kitne Cr ka kaam close kiya hai aur company ko kitni net brokerage mil rahi hai.',
      'Aapka saara data browser mein automatic save hota rehta hai. Kisi client ko software dene ya backup lene ke liye /settings par "Export Brokerage JSON Backup" dabaiye, aur naya demo dene ke liye "Restore Default Indian Sample" use karein.',
    ],
  },
];

export function HowItWorksView() {
  const { settings, accent } = useBrokerage();
  const [lang, setLang] = useState<GuideLang>('hinglish');

  const isHi = lang === 'hinglish';

  return (
    <div className="space-y-6">
      {/* Header & Language Switcher */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <p className="text-xs font-medium text-slate-500">
            {settings.brokerageName} · Complete User & Demo Guide
          </p>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 text-balance">
            {isHi
              ? 'Software Kaise Use Karein — Poori Jankari (Step-by-Step Guide)'
              : 'How Keystone Broker OS Works — Complete Step-by-Step Guide'}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {isHi
              ? 'Yahan jaaniye ki aap apni ya apne client ki real estate agency ke liye RERA listings, WhatsApp AI leads, TDS/Stamp Duty calculators aur White-Label branding kaise use kar sakte hain.'
              : 'Everything your brokerage team or channel partners need to configure white-label branding, publish RERA listings, manage WhatsApp enquiries, and close deals.'}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Guide language"
          className="grid grid-cols-2 sm:inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0 self-start md:self-center w-full sm:w-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={isHi}
            onClick={() => setLang('hinglish')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap min-h-[42px] sm:min-h-[38px] ${
              isHi
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hinglish (सरल हिंदी)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isHi}
            onClick={() => setLang('english')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap min-h-[42px] sm:min-h-[38px] ${
              !isHi
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English
          </button>
        </div>
      </section>

      {/* Quick Module Directory Strip */}
      <section aria-label="Quick module links" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {WORKFLOW_STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <Link
              key={step.number}
              href={step.route}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors flex flex-col justify-between gap-3 min-h-[104px]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-semibold text-slate-400">
                  {step.number}.
                </span>
                <Icon className={`w-4 h-4 ${accent.primaryText}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 line-clamp-2">
                  {isHi ? step.routeLabelHi : step.routeLabelEn}
                </p>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5 truncate">
                  {step.route}
                </p>
              </div>
            </Link>
          );
        })}
      </section>

      {/* Detailed 5-Step Workflow Cards */}
      <section aria-label="Detailed workflow guide" className="space-y-4">
        {WORKFLOW_STEPS.map((step) => {
          const Icon = step.icon;
          const bullets = isHi ? step.stepsHi : step.stepsEn;

          return (
            <article
              key={step.number}
              className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="font-mono font-semibold text-slate-700">
                      {step.number}.
                    </span>
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono">{step.route}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {isHi ? step.titleHi : step.titleEn}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {isHi ? step.summaryHi : step.summaryEn}
                  </p>
                </div>

                <Link
                  href={step.route}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[44px] sm:min-h-[40px] ${accent.primaryBg} ${accent.primaryHover}`}
                >
                  <span>{isHi ? step.routeLabelHi : step.routeLabelEn}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Link>
              </div>

              <ol className="space-y-2.5">
                {bullets.map((line, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed"
                  >
                    <span className="font-mono tabular-nums text-xs font-semibold text-slate-400 pt-1 shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
            </article>
          );
        })}
      </section>
    </div>
  );
}
