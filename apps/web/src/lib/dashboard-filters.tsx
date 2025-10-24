'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type FlowFilter = 'income' | 'expense' | 'transfer' | undefined;

export interface DashboardFiltersState {
  startDate?: string;
  endDate?: string;
  flow?: FlowFilter;
  categoryId?: string;
  accountId?: string;
  cardId?: string;
  planned?: boolean;
  reconciled?: boolean;
}

type Settable<T> = T | ((prev: T) => T);

interface DashboardFiltersContextValue {
  filters: DashboardFiltersState;
  setFilters: (next: Settable<DashboardFiltersState>) => void;
  clearFilters: () => void;
  isActive: boolean;
}

const DashboardFiltersContext = createContext<DashboardFiltersContextValue | undefined>(undefined);

function parseBool(val: string | null): boolean | undefined {
  if (val === null || val === '') return undefined;
  return val === 'true';
}

export function DashboardFiltersProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const search = useSearchParams();
  const [filters, setFiltersState] = useState<DashboardFiltersState>({});

  // Inicializa a partir da URL
  useEffect(() => {
    const initial: DashboardFiltersState = {
      startDate: search.get('startDate') || undefined,
      endDate: search.get('endDate') || undefined,
      flow: (search.get('flow') as FlowFilter) || undefined,
      categoryId: search.get('categoryId') || undefined,
      accountId: search.get('accountId') || undefined,
      cardId: search.get('cardId') || undefined,
      planned: parseBool(search.get('planned')),
      reconciled: parseBool(search.get('reconciled')),
    };
    setFiltersState(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincroniza para a URL quando filtros mudam
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.flow) params.set('flow', filters.flow);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.accountId) params.set('accountId', filters.accountId);
    if (filters.cardId) params.set('cardId', filters.cardId);
    if (filters.planned !== undefined) params.set('planned', String(filters.planned));
    if (filters.reconciled !== undefined) params.set('reconciled', String(filters.reconciled));

    const qs = params.toString();
    const url = qs ? `/dashboard?${qs}` : '/dashboard';
    router.replace(url);
  }, [filters, router]);

  const setFilters = (next: Settable<DashboardFiltersState>) => {
    setFiltersState(prev => (typeof next === 'function' ? (next as any)(prev) : next));
  };

  const clearFilters = () => setFiltersState({});

  const value = useMemo<DashboardFiltersContextValue>(
    () => ({ filters, setFilters, clearFilters, isActive: Object.keys(filters).length > 0 }),
    [filters],
  );

  return (
    <DashboardFiltersContext.Provider value={value}>{children}</DashboardFiltersContext.Provider>
  );
}

export function useDashboardFilters() {
  const ctx = useContext(DashboardFiltersContext);
  if (!ctx) throw new Error('useDashboardFilters must be used within DashboardFiltersProvider');
  return ctx;
}
