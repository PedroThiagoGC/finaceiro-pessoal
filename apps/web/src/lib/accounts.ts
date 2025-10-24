import { Account, AccountType, CreateAccountInput } from '@pwr/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './api';

export type AccountListItem = {
  id: string;
  name: string;
  type: AccountType;
  openingBalance: number;
  currency: string;
};

export async function fetchAccounts(): Promise<AccountListItem[]> {
  const res = await api.get('/accounts');
  return res.data.data;
}

export async function fetchAccount(id: string): Promise<Account> {
  const res = await api.get(`/accounts/${id}`);
  return res.data.data;
}

export async function createAccount(payload: CreateAccountInput): Promise<Account> {
  const res = await api.post('/accounts', payload);
  return res.data.data;
}

export async function updateAccount(id: string, payload: Partial<CreateAccountInput>): Promise<Account> {
  const res = await api.put(`/accounts/${id}`, payload);
  return res.data.data;
}

export async function deleteAccount(id: string): Promise<void> {
  await api.delete(`/accounts/${id}`);
}

export function useAccounts() {
  return useQuery({ queryKey: ['accounts'], queryFn: fetchAccounts });
}

export function useAccount(id?: string) {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: () => fetchAccount(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateAccountInput> }) =>
      api.put(`/accounts/${id}`, payload).then(res => res.data.data as Account),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['accounts'] });
      qc.invalidateQueries({ queryKey: ['accounts', variables.id] });
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}
