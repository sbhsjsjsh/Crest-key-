import type { Metadata } from 'next';
import { ListingsView } from '@/components/ListingsView';

export const metadata: Metadata = {
  title: 'RERA Property Portfolio & AI Marketing Studio',
  description:
    'Manage RERA-registered apartments, villas, and commercial spaces while generating 99acres, Magicbricks, and WhatsApp listing copy.',
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string; selected?: string }>;
}) {
  const params = await searchParams;
  return (
    <ListingsView
      initialNew={params.new === '1'}
      initialSelectedId={params.selected}
    />
  );
}
