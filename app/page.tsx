import type { Metadata } from 'next';
import { DashboardView } from '@/components/DashboardView';

export const metadata: Metadata = {
  title: 'Executive Brokerage Overview – RERA & Pipeline',
  description:
    'Monitor active Indian real estate inventory in Crores and Lakhs, token deals, buyer pipeline stages, and channel advisor fee retention.',
};

export default function HomePage() {
  return <DashboardView />;
}
