'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchDashboardStats();
  }, [user, router]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/analytics/overview', {
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PWR Finanças</h1>
            <p className="text-sm text-gray-600">Olá, {user.name}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
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
              />
              <StatCard
                title="Despesas"
                value={stats?.totalExpense || 0}
                color="red"
              />
              <StatCard
                title="Saldo"
                value={stats?.balance || 0}
                color={stats && stats.balance >= 0 ? 'blue' : 'red'}
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

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionButton
              label="Nova Transação"
              icon="💸"
              onClick={() => alert('Em desenvolvimento')}
            />
            <QuickActionButton
              label="Contas"
              icon="🏦"
              onClick={() => alert('Em desenvolvimento')}
            />
            <QuickActionButton
              label="Cartões"
              icon="💳"
              onClick={() => alert('Em desenvolvimento')}
            />
            <QuickActionButton
              label="Categorias"
              icon="📊"
              onClick={() => alert('Em desenvolvimento')}
            />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Transações Recentes</h2>
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma transação encontrada</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              onClick={() => alert('Em desenvolvimento')}
            >
              Adicionar Primeira Transação
            </button>
          </div>
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
}

function StatCard({ title, value, color, isCount = false }: StatCardProps) {
  const colorClasses = {
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
      <p className={`text-3xl font-bold ${colorClasses[color]}`}>
        {isCount ? value : `R$ ${value.toFixed(2)}`}
      </p>
    </div>
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
