import type { Metadata } from 'next';
import { SettingsView } from '@/components/SettingsView';

export const metadata: Metadata = {
  title: 'White-Label Agency & RERA Setup',
  description:
    'Customize brokerage name, RERA registration number, advisor splits, and brand theme colors for instant client deployment.',
};

export default function SettingsPage() {
  return <SettingsView />;
}
