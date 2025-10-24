'use client';

import { useAccounts } from '@/lib/accounts';
import { useCards } from '@/lib/cards';
import { useCategories } from '@/lib/categories';
import { useDeleteTransaction, useReconcileTransaction, useTransactions } from '@/lib/transactions';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function TransactionsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    categoryId: '',
    accountId: '',
    cardId: '',
    planned: undefined as boolean | undefined,
    reconciled: undefined as boolean | undefined,
  });

  const { data: transactions, isLoading } = useTransactions(filters);
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();
  const { data: cards } = useCards();

  const deleteMutation = useDeleteTransaction();
  const reconcileMutation = useReconcileTransaction();

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleReconcile = async (id: string) => {
    await reconcileMutation.mutateAsync(id);
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      categoryId: '',
      accountId: '',
      cardId: '',
      planned: undefined,
      reconciled: undefined,
    });
  };

  const getFlowColor = (flow: string) => {
    switch (flow) {
      case 'income':
        return 'text-green-600';
      case 'expense':
        return 'text-red-600';
      case 'transfer':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getFlowLabel = (flow: string) => {
    switch (flow) {
      case 'income':
        return 'Receita';
      case 'expense':
        return 'Despesa';
      case 'transfer':
        return 'Transferência';
      default:
        return flow;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Voltar
            </button>
            <Link
              href="/transactions/upload"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              📷 Upload OCR
            </Link>
            <Link
              href="/transactions/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Nova Transação
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                value={filters.categoryId}
                onChange={e => setFilters({ ...filters, categoryId: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                {categories?.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conta</label>
              <select
                value={filters.accountId}
                onChange={e => setFilters({ ...filters, accountId: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                {accounts?.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cartão</label>
              <select
                value={filters.cardId}
                onChange={e => setFilters({ ...filters, cardId: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {cards?.map(card => (
                  <option key={card.id} value={card.id}>
                    {card.nickname}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.reconciled === undefined ? '' : filters.reconciled ? 'true' : 'false'}
                onChange={e =>
                  setFilters({
                    ...filters,
                    reconciled: e.target.value === '' ? undefined : e.target.value === 'true',
                  })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                <option value="true">Conciliadas</option>
                <option value="false">Não Conciliadas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={filters.planned === undefined ? '' : filters.planned ? 'true' : 'false'}
                onChange={e =>
                  setFilters({
                    ...filters,
                    planned: e.target.value === '' ? undefined : e.target.value === 'true',
                  })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                <option value="true">Planejadas</option>
                <option value="false">Realizadas</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Transações */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Minhas Transações</h2>
          </div>
          <div className="divide-y">
            {isLoading && <div className="p-6 text-gray-500">Carregando...</div>}
            {!isLoading && transactions && transactions.length === 0 && (
              <div className="p-6 text-gray-500">Nenhuma transação encontrada.</div>
            )}
            {!isLoading &&
              transactions &&
              transactions.map(tx => {
                const category = categories?.find(c => c.id === tx.categoryId);
                const account = accounts?.find(a => a.id === tx.accountId);
                const card = cards?.find(c => c.id === tx.cardId);

                return (
                  <div key={tx.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{tx.description}</p>
                          {tx.planned && (
                            <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                              Planejada
                            </span>
                          )}
                          {tx.reconciled && (
                            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                              Conciliada
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span>{format(new Date(tx.date), 'dd/MM/yyyy')}</span>
                          <span className={getFlowColor(tx.flow)}>{getFlowLabel(tx.flow)}</span>
                          {category && (
                            <span>
                              <svg
                                className="inline w-3 h-3 mr-1"
                                fill={category.color}
                                viewBox="0 0 8 8"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <circle cx="4" cy="4" r="4" />
                              </svg>
                              {category.name}
                            </span>
                          )}
                          {account && <span>Conta: {account.name}</span>}
                          {card && <span>Cartão: {card.nickname}</span>}
                        </div>
                      </div>
                      <div className="ml-4 flex items-center gap-4">
                        <span className={`text-lg font-semibold ${getFlowColor(tx.flow)}`}>
                          {tx.flow === 'expense' ? '-' : '+'} R$ {tx.amount.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-2">
                          {!tx.reconciled && (
                            <button
                              onClick={() => handleReconcile(tx.id)}
                              className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100"
                              title="Conciliar"
                            >
                              ✓
                            </button>
                          )}
                          <Link
                            href={`/transactions/${tx.id}/edit`}
                            className="px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </main>
    </div>
  );
}
