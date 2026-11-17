import type { Metadata } from 'next';
import { HowItWorksView } from '@/components/HowItWorksView';

export const metadata: Metadata = {
  title: 'How It Works – User Guide & Hindi/English Walkthrough',
  description:
    'Step-by-step guide in Hinglish and English on how to configure white-label RERA branding, manage listings, run WhatsApp AI CRM, and calculate Sec 194-IA TDS.',
};

export default function HowItWorksPage() {
  return <HowItWorksView />;
}
