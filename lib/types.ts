export enum ListingStatus {
  ACTIVE = 'Available',
  PENDING = 'Token / Under Offer',
  CLOSED = 'Registered / Sold',
}

export enum PropertyCategory {
  APARTMENT = 'Luxury Apartment',
  VILLA = 'Villa / Bungalow',
  PENTHOUSE = 'Penthouse',
  COMMERCIAL = 'Commercial / Office',
}

export enum LeadStage {
  NEW = 'New Enquiry',
  TOURING = 'Site Visit Scheduled',
  OFFER = 'Negotiation / Token',
  CONTRACT = 'Agreement / Registration',
  CLOSED = 'Closed',
}

export enum LeadIntent {
  BUYER = 'End-User Buyer',
  SELLER = 'Seller Mandate',
  INVESTOR = 'NRI / Investor',
}

export enum AccentTheme {
  COBALT = 'cobalt',
  EMERALD = 'emerald',
  SLATE = 'slate',
  AMBER = 'amber',
}

export interface PropertyListing {
  id: string;
  reraCode: string;
  title: string;
  address: string;
  city: string;
  price: number;
  bhk: number;
  baths: number;
  sqft: number;
  category: PropertyCategory;
  status: ListingStatus;
  daysOnMarket: number;
  listingAgentId: string;
  imageKey: string;
  highlights: string;
  commissionRate: number;
}

export interface ClientLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  intent: LeadIntent;
  stage: LeadStage;
  budget: number;
  source: string;
  assignedAgentId: string;
  matchedListingId?: string;
  lastContacted: string;
  notes: string;
}

export interface AgentProfile {
  id: string;
  name: string;
  role: string;
  email: string;
  splitPercent: number;
  closedVolumeYtd: number;
  activeDeals: number;
}

export interface BrokerageSettings {
  brokerageName: string;
  marketRegion: string;
  managingBroker: string;
  reraNumber: string;
  defaultCommissionRate: number;
  defaultAgentSplit: number;
  accentTheme: AccentTheme;
}

export interface MarketingCopyResult {
  portalDescription: string;
  whatsappBroadcast: string;
  emailSubject: string;
  emailBody: string;
}

export interface OutreachDraftResult {
  whatsappDraft: string;
  emailSubject: string;
  emailBody: string;
}
