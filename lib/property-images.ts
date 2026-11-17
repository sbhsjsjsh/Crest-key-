import type { StaticImageData } from 'next/image';
import modernVillaImg from '@/src/assets/images/property_modern_villa_1794687635621.jpg';
import penthouseLoftImg from '@/src/assets/images/property_penthouse_loft_1794687635887.jpg';
import coastalEstateImg from '@/src/assets/images/property_coastal_estate_1794687636901.jpg';
import commercialSuiteImg from '@/src/assets/images/property_commercial_suite_1794687637057.jpg';

export const PROPERTY_IMAGES: Record<string, StaticImageData> = {
  villa: modernVillaImg,
  penthouse: penthouseLoftImg,
  coastal: coastalEstateImg,
  commercial: commercialSuiteImg,
};

export const IMAGE_KEY_OPTIONS = [
  { key: 'villa', label: 'Contemporary Residence' },
  { key: 'penthouse', label: 'Urban Penthouse' },
  { key: 'coastal', label: 'Waterfront Estate' },
  { key: 'commercial', label: 'Mixed-Use Commercial' },
];
