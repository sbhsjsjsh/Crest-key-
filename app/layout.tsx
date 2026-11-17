import type { Metadata, Viewport } from 'next';
import { DM_Sans, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { BrokerageProvider } from '@/components/BrokerageProvider';
import { AppShell } from '@/components/AppShell';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-plus-jakarta',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
});

const SITE_TITLE = 'Keystone Broker OS – Indian Real Estate CRM & RERA';
const SITE_DESCRIPTION =
  'Manage RERA listings, WhatsApp buyer pipelines, Sec 194-IA TDS net sheets, and Home Loan EMI calculators in one white-label Indian real estate CRM.';

function resolveMetadataBase(): URL | undefined {
  const raw = process.env.APP_URL;
  if (!raw || raw === 'MY_APP_URL') return undefined;
  try {
    return new URL(raw);
  } catch {
    return undefined;
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0f172a',
};

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  applicationName: 'Keystone Broker OS',
  title: {
    default: SITE_TITLE,
    template: '%s | Keystone Broker OS',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'Indian Real Estate CRM',
    'RERA Brokerage Software',
    'Channel Partner CRM India',
    'Section 194-IA TDS Calculator',
    'Home Loan EMI & Stamp Duty',
    'Real Estate White Label Software',
  ],
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Keystone Broker OS',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Keystone Broker OS',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'All',
  description: SITE_DESCRIPTION,
  offers: {
    '@type': 'Offer',
    price: '84000',
    priceCurrency: 'INR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-IN"
      className={`${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body suppressHydrationWarning className="overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <BrokerageProvider>
          <AppShell>{children}</AppShell>
        </BrokerageProvider>
      </body>
    </html>
  );
}
