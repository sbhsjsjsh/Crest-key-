import type { Metadata } from 'next';
import { LeadsView } from '@/components/LeadsView';

export const metadata: Metadata = {
  title: 'Client, Site-Visit & NRI Enquiry CRM',
  description:
    'Track Indian property buyers, seller mandates, and NRI investors across site visits and registrations with AI WhatsApp follow-ups.',
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const params = await searchParams;
  return <LeadsView initialNew={params.new === '1'} />;
}
