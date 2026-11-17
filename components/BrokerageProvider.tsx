'use client';

import React, {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';
import {
  AgentProfile,
  BrokerageSettings,
  ClientLead,
  LeadStage,
  ListingStatus,
  PropertyListing,
} from '@/lib/types';
import {
  DEFAULT_SETTINGS,
  INITIAL_AGENTS,
  INITIAL_LEADS,
  INITIAL_LISTINGS,
} from '@/lib/seed-data';
import { ACCENT_THEMES, AccentTokens } from '@/lib/format';

const STORAGE_KEY = 'keystone_broker_os_in_v1';

interface StoredState {
  settings: BrokerageSettings;
  agents: AgentProfile[];
  listings: PropertyListing[];
  leads: ClientLead[];
}

const DEFAULT_STORE_STATE: StoredState = {
  settings: DEFAULT_SETTINGS,
  agents: INITIAL_AGENTS,
  listings: INITIAL_LISTINGS,
  leads: INITIAL_LEADS,
};

let memoryState: StoredState = DEFAULT_STORE_STATE;
let isStoreLoaded = false;
const listeners = new Set<() => void>();

function readFromStorage(): StoredState {
  if (typeof window === 'undefined') return DEFAULT_STORE_STATE;
  if (isStoreLoaded) return memoryState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredState>;
      const rawSettings = parsed.settings
        ? { ...DEFAULT_SETTINGS, ...parsed.settings }
        : DEFAULT_SETTINGS;
      const cleanedBrokerageName = rawSettings.brokerageName
        .replace(/\bshikhar\s*/gi, '')
        .trim();
      const normalizedSettings = {
        ...rawSettings,
        brokerageName: cleanedBrokerageName || DEFAULT_SETTINGS.brokerageName,
      };
      const rawAgents =
        Array.isArray(parsed.agents) && parsed.agents.length > 0
          ? parsed.agents
          : INITIAL_AGENTS;
      const normalizedAgents = rawAgents.map((agent) => ({
        ...agent,
        email: agent.email.replace(/@shikharcrest\.in$/i, '@crestrealty.in'),
      }));

      memoryState = {
        settings: normalizedSettings,
        agents: normalizedAgents,
        listings: Array.isArray(parsed.listings)
          ? parsed.listings
          : INITIAL_LISTINGS,
        leads: Array.isArray(parsed.leads) ? parsed.leads : INITIAL_LEADS,
      };
    }
  } catch {
    memoryState = DEFAULT_STORE_STATE;
  }
  isStoreLoaded = true;
  return memoryState;
}

function updateStore(updater: (prev: StoredState) => StoredState) {
  const current = readFromStorage();
  memoryState = updater(current);
  isStoreLoaded = true;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState));
    } catch {
      // Ignore storage quota errors
    }
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): StoredState {
  return readFromStorage();
}

function getServerSnapshot(): StoredState {
  return DEFAULT_STORE_STATE;
}

interface BrokerageContextValue {
  settings: BrokerageSettings;
  agents: AgentProfile[];
  listings: PropertyListing[];
  leads: ClientLead[];
  accent: AccentTokens;
  updateSettings: (partial: Partial<BrokerageSettings>) => void;
  addListing: (listing: Omit<PropertyListing, 'id'>) => PropertyListing;
  updateListingStatus: (id: string, status: ListingStatus) => void;
  deleteListing: (id: string) => void;
  addLead: (lead: Omit<ClientLead, 'id'>) => ClientLead;
  updateLeadStage: (id: string, stage: LeadStage) => void;
  deleteLead: (id: string) => void;
  addAgent: (agent: Omit<AgentProfile, 'id'>) => void;
  removeAgent: (id: string) => void;
  resetDemoData: () => void;
}

const BrokerageContext = createContext<BrokerageContextValue | null>(null);

export function BrokerageProvider({ children }: { children: React.ReactNode }) {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const updateSettings = (partial: Partial<BrokerageSettings>) => {
    updateStore((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...partial },
    }));
  };

  const addListing = (listing: Omit<PropertyListing, 'id'>): PropertyListing => {
    const created: PropertyListing = {
      ...listing,
      id: `lst-${Date.now().toString(36)}`,
    };
    updateStore((prev) => ({
      ...prev,
      listings: [created, ...prev.listings],
    }));
    return created;
  };

  const updateListingStatus = (id: string, status: ListingStatus) => {
    updateStore((prev) => ({
      ...prev,
      listings: prev.listings.map((item) =>
        item.id === id ? { ...item, status } : item
      ),
    }));
  };

  const deleteListing = (id: string) => {
    updateStore((prev) => ({
      ...prev,
      listings: prev.listings.filter((item) => item.id !== id),
    }));
  };

  const addLead = (lead: Omit<ClientLead, 'id'>): ClientLead => {
    const created: ClientLead = {
      ...lead,
      id: `ld-${Date.now().toString(36)}`,
    };
    updateStore((prev) => ({
      ...prev,
      leads: [created, ...prev.leads],
    }));
    return created;
  };

  const updateLeadStage = (id: string, stage: LeadStage) => {
    updateStore((prev) => ({
      ...prev,
      leads: prev.leads.map((item) =>
        item.id === id ? { ...item, stage, lastContacted: 'Just now' } : item
      ),
    }));
  };

  const deleteLead = (id: string) => {
    updateStore((prev) => ({
      ...prev,
      leads: prev.leads.filter((item) => item.id !== id),
    }));
  };

  const addAgent = (agent: Omit<AgentProfile, 'id'>) => {
    const created: AgentProfile = {
      ...agent,
      id: `ag-${Date.now().toString(36)}`,
    };
    updateStore((prev) => ({
      ...prev,
      agents: [...prev.agents, created],
    }));
  };

  const removeAgent = (id: string) => {
    updateStore((prev) => ({
      ...prev,
      agents:
        prev.agents.length > 1
          ? prev.agents.filter((a) => a.id !== id)
          : prev.agents,
    }));
  };

  const resetDemoData = () => {
    memoryState = DEFAULT_STORE_STATE;
    isStoreLoaded = true;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
    listeners.forEach((listener) => listener());
  };

  const accent = useMemo(
    () => ACCENT_THEMES[store.settings.accentTheme] ?? ACCENT_THEMES.cobalt,
    [store.settings.accentTheme]
  );

  return (
    <BrokerageContext.Provider
      value={{
        settings: store.settings,
        agents: store.agents,
        listings: store.listings,
        leads: store.leads,
        accent,
        updateSettings,
        addListing,
        updateListingStatus,
        deleteListing,
        addLead,
        updateLeadStage,
        deleteLead,
        addAgent,
        removeAgent,
        resetDemoData,
      }}
    >
      {children}
    </BrokerageContext.Provider>
  );
}

export function useBrokerage() {
  const ctx = useContext(BrokerageContext);
  if (!ctx) {
    throw new Error('useBrokerage must be used within BrokerageProvider');
  }
  return ctx;
}
