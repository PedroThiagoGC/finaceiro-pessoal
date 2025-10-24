import { Card, CreateCardInput } from '@pwr/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './api';

export type CardListItem = {
  id: string;
  nickname: string;
  brand: string;
  creditLimit: number;
  billingDay: number;
  dueDay: number;
};

export async function fetchCards(): Promise<CardListItem[]> {
  const res = await api.get('/cards');
  return res.data.data;
}

export async function fetchCard(id: string): Promise<Card> {
  const res = await api.get(`/cards/${id}`);
  return res.data.data;
}

export async function createCard(payload: CreateCardInput): Promise<Card> {
  const res = await api.post('/cards', payload);
  return res.data.data;
}

export async function updateCard(id: string, payload: Partial<CreateCardInput>): Promise<Card> {
  const res = await api.put(`/cards/${id}`, payload);
  return res.data.data;
}

export async function deleteCard(id: string): Promise<void> {
  await api.delete(`/cards/${id}`);
}

export function useCards() {
  return useQuery({ queryKey: ['cards'], queryFn: fetchCards });
}

export function useCard(id?: string) {
  return useQuery({
    queryKey: ['cards', id],
    queryFn: () => fetchCard(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCard,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cards'] }),
  });
}

export function useUpdateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateCardInput> }) =>
      api.put(`/cards/${id}`, payload).then(res => res.data.data as Card),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['cards'] });
      qc.invalidateQueries({ queryKey: ['cards', vars.id] });
    },
  });
}

export function useDeleteCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCard,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cards'] }),
  });
}
