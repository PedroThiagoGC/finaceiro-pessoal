'use client';

import { useAccounts, useDeleteAccount } from '@/lib/accounts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountsPage() {
  const router = useRouter();
  const { data, isLoading } = useAccounts();
  const deleteMutation = useDeleteAccount();

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Contas</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Voltar
            </button>
            <Link
              href="/accounts/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Nova Conta
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Minhas Contas</h2>
          </div>
          <div className="divide-y">
            {isLoading && (
              <div className="p-6 text-gray-500">Carregando...</div>
            )}
            {!isLoading && data && data.length === 0 && (
              <div className="p-6 text-gray-500">Nenhuma conta cadastrada.</div>
            )}
            {!isLoading && data && data.map(acc => (
              <div key={acc.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{acc.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{acc.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/accounts/${acc.id}/edit`}
                    className="px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(acc.id)}
                    className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
