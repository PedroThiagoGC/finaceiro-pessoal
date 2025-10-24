'use client';

import { useRecentTransactions } from '@/lib/transactions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RecentTransactionsList() {
  const { data, isLoading } = useRecentTransactions(5);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhuma transação encontrada</p>
        <a
          className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          href="/transactions/new"
        >
          Adicionar Primeira Transação
        </a>
      </div>
    );
  }

  return (
    <ul className="divide-y">
      {data.map(tx => (
        <li key={tx.id} className="py-3 flex items-center justify-between">
          <div>
            <p className="font-medium">{tx.description}</p>
            <p className="text-sm text-gray-500">
              {format(new Date(tx.date), "dd 'de' MMMM", { locale: ptBR })}
              {tx.categoryId ? ' • Categoria' : ''}
            </p>
          </div>
          <div className={`text-right font-semibold ${tx.flow === 'income' ? 'text-green-600' : 'text-red-600'}`}>
            {tx.flow === 'income' ? '+ ' : '- '}
            {Math.abs(tx.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
        </li>
      ))}
    </ul>
  );
}
