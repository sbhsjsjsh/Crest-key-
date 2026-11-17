import type { Metadata } from 'next';
import { CalculatorsView } from '@/components/CalculatorsView';

export const metadata: Metadata = {
  title: 'Sec 194-IA TDS Net Sheet, Stamp Duty & EMI Calculators',
  description:
    'Calculate Indian seller net proceeds with 1% Sec 194-IA TDS, 18% GST, state-wise stamp duty, Home Loan EMI, and rental yield.',
};

export default function CalculatorsPage() {
  return <CalculatorsView />;
}
