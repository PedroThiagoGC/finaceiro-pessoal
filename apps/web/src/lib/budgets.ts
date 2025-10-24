'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

export type BudgetPeriod = 'monthly' | 'quarterly' | 'annual';

export interface Budget {
  id: string;
  userId: string;
  period: BudgetPeriod;
  year: number;
  month?: number | null;
  categoryId?: string | null;
  amount: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
}

export interface BudgetProgress {
  budgetId: string;
  period: BudgetPeriod;
  year: number;
  month?: number;
  categoryName?: string;
  budgetedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentUsed: number;
  status: 'safe' | 'warning' | 'exceeded';
}

export interface CreateBudgetData {
  period: BudgetPeriod;
  year: number;
  month?: number;
  categoryId?: string;
  amount: number;
}

export interface UpdateBudgetData {
  period?: BudgetPeriod;
  year?: number;
  month?: number;
  categoryId?: string;
  amount?: number;
}

export interface BudgetFilters {
  period?: BudgetPeriod;
  year?: number;
  month?: number;
  categoryId?: string;
}

/**
 * Busca orçamentos do usuário
 */
export async function fetchBudgets(filters?: BudgetFilters): Promise<Budget[]> {
  const params = new URLSearchParams();
  if (filters?.period) params.append('period', filters.period);
  if (filters?.year) params.append('year', String(filters.year));
  if (filters?.month) params.append('month', String(filters.month));
  if (filters?.categoryId) params.append('categoryId', filters.categoryId);

  const queryString = params.toString();
  const url = `/budgets${queryString ? `?${queryString}` : ''}`;

  const response = await api.get<Budget[]>(url);
  return response.data;
}

/**
 * Busca orçamento por ID
 */
export async function fetchBudget(id: string): Promise<Budget> {
  const response = await api.get<Budget>(`/budgets/${id}`);
  return response.data;
}

/**
 * Cria novo orçamento
 */
export async function createBudget(data: CreateBudgetData): Promise<Budget> {
  const response = await api.post<Budget>('/budgets', data);
  return response.data;
}

/**
 * Atualiza orçamento
 */
export async function updateBudget(
  id: string,
  data: UpdateBudgetData,
): Promise<Budget> {
  const response = await api.put<Budget>(`/budgets/${id}`, data);
  return response.data;
}

/**
 * Remove orçamento
 */
export async function deleteBudget(id: string): Promise<void> {
  await api.delete(`/budgets/${id}`);
}

/**
 * Busca progresso de um orçamento
 */
export async function fetchBudgetProgress(
  id: string,
): Promise<BudgetProgress> {
  const response = await api.get<BudgetProgress>(`/budgets/${id}/progress`);
  return response.data;
}

/**
 * Busca progresso de todos os orçamentos
 */
export async function fetchAllBudgetsProgress(): Promise<BudgetProgress[]> {
  const response = await api.get<BudgetProgress[]>('/budgets/progress');
  return response.data;
}

// React Query Hooks

export function useBudgets(filters?: BudgetFilters) {
  return useQuery({
    queryKey: ['budgets', filters],
    queryFn: () => fetchBudgets(filters),
  });
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: ['budgets', id],
    queryFn: () => fetchBudget(id),
    enabled: !!id,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgetProgress'] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetData }) =>
      updateBudget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgetProgress'] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgetProgress'] });
    },
  });
}

export function useBudgetProgress(id: string) {
  return useQuery({
    queryKey: ['budgetProgress', id],
    queryFn: () => fetchBudgetProgress(id),
    enabled: !!id,
  });
}

export function useAllBudgetsProgress() {
  return useQuery({
    queryKey: ['budgetProgress', 'all'],
    queryFn: fetchAllBudgetsProgress,
  });
}
