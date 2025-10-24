import { CreateTransactionInput, Transaction } from '@pwr/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './api';

export type TransactionListItem = {
  id: string;
  date: Date | string;
  description: string;
  amount: number;
  flow: string;
  categoryId: string;
  accountId: string | null;
  cardId: string | null;
  planned: boolean;
  reconciled: boolean;
};

export async function fetchRecentTransactions(limit = 5): Promise<Transaction[]> {
  const res = await api.get(`/transactions?limit=${limit}`);
  return res.data.data;
}

export async function fetchTransactions(params?: {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  flow?: 'income' | 'expense' | 'transfer';
  categoryId?: string;
  accountId?: string;
  cardId?: string;
  planned?: boolean;
  reconciled?: boolean;
}): Promise<Transaction[]> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.flow) queryParams.append('flow', params.flow);
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params?.accountId) queryParams.append('accountId', params.accountId);
  if (params?.cardId) queryParams.append('cardId', params.cardId);
  if (params?.planned !== undefined) queryParams.append('planned', params.planned.toString());
  if (params?.reconciled !== undefined) queryParams.append('reconciled', params.reconciled.toString());

  const res = await api.get(`/transactions?${queryParams.toString()}`);
  return res.data.data;
}

export async function fetchTransaction(id: string): Promise<Transaction> {
  const res = await api.get(`/transactions/${id}`);
  return res.data.data;
}

export async function createTransaction(payload: CreateTransactionInput): Promise<Transaction> {
  const res = await api.post('/transactions', payload);
  return res.data.data;
}

export async function updateTransaction(id: string, payload: Partial<CreateTransactionInput>): Promise<Transaction> {
  const res = await api.put(`/transactions/${id}`, payload);
  return res.data.data;
}

export async function deleteTransaction(id: string): Promise<void> {
  await api.delete(`/transactions/${id}`);
}

export async function reconcileTransaction(id: string): Promise<Transaction> {
  const res = await api.post(`/transactions/${id}/reconcile`, {});
  return res.data.data;
}

export function useRecentTransactions(limit = 5) {
  return useQuery({ queryKey: ['transactions', 'recent', limit], queryFn: () => fetchRecentTransactions(limit) });
}

export function useTransactions(params?: Parameters<typeof fetchTransactions>[0]) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => fetchTransactions(params),
  });
}

export function useTransaction(id?: string) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => fetchTransaction(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateTransactionInput> }) =>
      api.put(`/transactions/${id}`, payload).then(res => res.data.data as Transaction),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['transactions', vars.id] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useReconcileTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reconcileTransaction,
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['transactions', id] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
