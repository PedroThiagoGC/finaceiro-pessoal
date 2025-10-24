'use client';

import RecentTransactionsList from '@/components/transactions/RecentTransactionsList';
import { useAuth } from '@/lib/auth-context';
import { DashboardFiltersProvider, useDashboardFilters } from '@/lib/dashboard-filters';
import { useTransactions } from '@/lib/transactions';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export default function DashboardPage() {
  return (
    <DashboardFiltersProvider>
      <DashboardContent />
    </DashboardFiltersProvider>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { filters, setFilters, clearFilters, isActive } = useDashboardFilters();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchDashboardStats();
  }, [user, router, filters.startDate, filters.endDate, filters.categoryId, filters.accountId, filters.cardId, filters.flow, filters.planned, filters.reconciled]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.accountId) params.append('accountId', filters.accountId);
      if (filters.cardId) params.append('cardId', filters.cardId);
      if (filters.flow) params.append('flow', filters.flow);
      if (filters.planned !== undefined) params.append('planned', String(filters.planned));
      if (filters.reconciled !== undefined) params.append('reconciled', String(filters.reconciled));

      const qs = params.toString();
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiBase}/analytics/overview${qs ? `?${qs}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Lista de transações filtradas (limit 5) — precisa estar antes de qualquer early return para manter a ordem dos hooks
  const { data: filteredTxs, isLoading: loadingTxs } = useTransactions({
    limit: 5,
    startDate: filters.startDate,
    endDate: filters.endDate,
    flow: filters.flow,
    categoryId: filters.categoryId,
    accountId: filters.accountId,
    cardId: filters.cardId,
    planned: filters.planned,
    reconciled: filters.reconciled,
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {/* Stats Cards (clicáveis para filtrar) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Receitas"
                value={stats?.totalIncome || 0}
                color="green"
                onClick={() => setFilters(prev => ({ ...prev, flow: 'income' }))}
              />
              <StatCard
                title="Despesas"
                value={stats?.totalExpense || 0}
                color="red"
                onClick={() => setFilters(prev => ({ ...prev, flow: 'expense' }))}
              />
              <StatCard
                title="Saldo"
                value={stats?.balance || 0}
                color={stats && stats.balance >= 0 ? 'blue' : 'red'}
                onClick={() => setFilters(prev => ({ ...prev, flow: undefined }))}
              />
              <StatCard
                title="Transações"
                value={stats?.transactionCount || 0}
                color="purple"
                isCount
              />
            </>
          )}
        </div>

        {/* Barra de filtros ativos */}
        {isActive && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="text-sm text-blue-900">
              <span className="font-semibold mr-2">Filtros ativos:</span>
              {filters.startDate && <span className="mr-2">Início: {filters.startDate}</span>}
              {filters.endDate && <span className="mr-2">Fim: {filters.endDate}</span>}
              {filters.flow && <span className="mr-2">Tipo: {filters.flow}</span>}
              {filters.categoryId && <span className="mr-2">Categoria selecionada</span>}
              {filters.accountId && <span className="mr-2">Conta selecionada</span>}
              {filters.cardId && <span className="mr-2">Cartão selecionado</span>}
              {filters.planned !== undefined && (
                <span className="mr-2">{filters.planned ? 'Planejadas' : 'Realizadas'}</span>
              )}
              {filters.reconciled !== undefined && (
                <span className="mr-2">{filters.reconciled ? 'Conciliadas' : 'Não conciliadas'}</span>
              )}
            </div>
            <button onClick={clearFilters} className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Limpar filtros</button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionButton
              label="Nova Transação"
              icon="💸"
              onClick={() => router.push('/transactions/new')}
            />
            <QuickActionButton
              label="Contas"
              icon="🏦"
              onClick={() => router.push('/accounts')}
            />
            <QuickActionButton
              label="Cartões"
              icon="💳"
              onClick={() => router.push('/cards')}
            />
            <QuickActionButton
              label="Categorias"
              icon="📊"
              onClick={() => router.push('/categories')}
            />
          </div>
        </div>

  {/* Gastos por Categoria (clicável) */}
  <CategorySpendWidget />

  {/* Gastos por Cartão (mês atual/selecionado) */}
  <CardSpendWidget />

  {/* Cashflow do mês (clicável por dia) */}
  <CashflowWidget />

        {/* Recent/Filtered Transactions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {isActive ? 'Transações Filtradas' : 'Transações Recentes'}
          </h2>
          {isActive ? (
            loadingTxs ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <ul className="divide-y">
                {filteredTxs?.map(tx => (
                  <li key={tx.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-sm text-gray-500">{new Date(tx.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className={`text-right font-semibold ${tx.flow === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.flow === 'income' ? '+ ' : '- '}
                      {Math.abs(tx.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <RecentTransactionsList />
          )}
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  color: 'green' | 'red' | 'blue' | 'purple';
  isCount?: boolean;
  onClick?: () => void;
}

function StatCard({ title, value, color, isCount = false, onClick }: StatCardProps) {
  const colorClasses = {
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  return (
    <button onClick={onClick} className="bg-white rounded-lg shadow p-6 text-left w-full hover:bg-gray-50">
      <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
      <p className={`text-3xl font-bold ${colorClasses[color]}`}>
        {isCount ? value : `R$ ${value.toFixed(2)}`}
      </p>
    </button>
  );
}

interface QuickActionButtonProps {
  label: string;
  icon: string;
  onClick: () => void;
}

function QuickActionButton({ label, icon, onClick }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
    >
      <span className="text-3xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  );
}

function CategorySpendWidget() {
  const { filters, setFilters } = useDashboardFilters();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Array<{ categoryId: string; categoryName: string; expense: number; income: number }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.categoryId) params.append('categoryId', filters.categoryId);
        if (filters.accountId) params.append('accountId', filters.accountId);
        if (filters.cardId) params.append('cardId', filters.cardId);
        if (filters.flow) params.append('flow', filters.flow);
        if (filters.planned !== undefined) params.append('planned', String(filters.planned));
        if (filters.reconciled !== undefined) params.append('reconciled', String(filters.reconciled));

        const qs = params.toString();
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const resp = await fetch(`${apiBase}/analytics/by-category${qs ? `?${qs}` : ''}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.ok) {
          const json = await resp.json();
          // json.data is array with categoryId, categoryName, income, expense
          setItems(json.data || []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Gastos por Categoria</h2>
        {filters.categoryId && (
          <button
            onClick={() => setFilters(prev => ({ ...prev, categoryId: undefined }))}
            className="text-sm text-blue-700 hover:underline"
          >
            Limpar seleção
          </button>
        )}
      </div>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-500">Sem dados para o período selecionado.</p>
      ) : (
        <ul className="divide-y">
          {items.map(item => (
            <li key={item.categoryId} className="py-2 flex items-center justify-between">
              <button
                className={`text-left flex-1 hover:bg-gray-50 rounded px-2 py-1 ${
                  filters.categoryId === item.categoryId ? 'bg-blue-50' : ''
                }`}
                onClick={() => setFilters(prev => ({ ...prev, categoryId: item.categoryId }))}
                title="Filtrar por categoria"
              >
                <span className="font-medium text-gray-800">{item.categoryName}</span>
              </button>
              <div className="text-right w-40">
                <div className="text-sm text-gray-500">Despesa</div>
                <div className="font-semibold text-red-600">
                  {item.expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CardSpendWidget() {
  const { filters, setFilters } = useDashboardFilters();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Array<{ cardId: string; cardNickname: string; spend: number }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        let monthParam = '';
        const monthSrc = filters.startDate || new Date().toISOString().slice(0,10);
        if (monthSrc) {
          const d = new Date(monthSrc);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          monthParam = `${yyyy}-${mm}`;
        }
        const params = new URLSearchParams();
        if (monthParam) params.append('month', monthParam);
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const resp = await fetch(`${apiBase}/analytics/by-card?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.ok) {
          const json = await resp.json();
          setItems(json.data || []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters.startDate]);

  const max = items.reduce((m, i) => Math.max(m, i.spend), 0) || 1;
  const widthClass = (value: number) => `w-[${Math.min(100, Math.max(0, (value / max) * 100)).toFixed(2)}%]`;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Gastos por Cartão</h2>
        {filters.cardId && (
          <button
            onClick={() => setFilters(prev => ({ ...prev, cardId: undefined }))}
            className="text-sm text-blue-700 hover:underline"
          >
            Limpar seleção
          </button>
        )}
      </div>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-500">Sem dados para o mês selecionado.</p>
      ) : (
        <ul className="space-y-2">
          {items.map(item => (
            <li key={item.cardId}>
              <button
                className={`w-full text-left px-2 py-1 rounded hover:bg-gray-50 ${filters.cardId === item.cardId ? 'bg-blue-50' : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, cardId: item.cardId }))}
                title="Filtrar por cartão"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{item.cardNickname}</span>
                  <span className="font-semibold text-red-600">{item.spend.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded mt-1">
                  <div className={`h-2 bg-red-500 rounded ${widthClass(item.spend)}`} />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CashflowWidget() {
  const { filters, setFilters } = useDashboardFilters();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Array<{ date: string; income: number; expense: number; balance: number }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const src = filters.startDate ? new Date(filters.startDate) : new Date();
        const year = src.getFullYear();
        const month = src.getMonth() + 1;
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const resp = await fetch(`${apiBase}/analytics/cashflow?year=${year}&month=${month}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.ok) {
          const json = await resp.json();
          setItems(json.data || []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters.startDate]);

  const maxAbs = items.reduce((m, i) => Math.max(m, Math.abs(i.income), Math.abs(i.expense), Math.abs(i.balance)), 1);
  const wAbs = (v: number) => `w-[${Math.min(100, Math.max(0, (Math.abs(v) / maxAbs) * 100)).toFixed(2)}%]`;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Cashflow do Mês</h2>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-500">Sem dados para o mês.</p>
      ) : (
        <div className="space-y-2">
          {items.map((d) => (
            <button
              key={d.date}
              onClick={() => setFilters(prev => ({ ...prev, startDate: d.date, endDate: d.date }))}
              className="w-full text-left"
              title="Filtrar por dia"
            >
              <div className="flex items-center gap-3">
                <div className="w-16 text-xs text-gray-500">{new Date(d.date).toLocaleDateString('pt-BR')}</div>
                <div className="flex-1">
                  <div className={`h-2 bg-green-200 rounded mb-1 ${wAbs(d.income)}`} />
                  <div className={`h-2 bg-red-200 rounded mb-1 ${wAbs(d.expense)}`} />
                  <div className={`h-1 bg-blue-300 rounded ${wAbs(d.balance)}`} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
