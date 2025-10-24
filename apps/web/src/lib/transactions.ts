import { Transaction } from '@pwr/types';
import { useQuery } from '@tanstack/react-query';
import api from './api';

export async function fetchRecentTransactions(limit = 5): Promise<Transaction[]> {
  const res = await api.get('/transactions', { params: { limit } });
  return res.data.data;
}

export function useRecentTransactions(limit = 5) {
  return useQuery({ queryKey: ['transactions', 'recent', limit], queryFn: () => fetchRecentTransactions(limit) });
}
