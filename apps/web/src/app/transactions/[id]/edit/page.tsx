'use client';

import TransactionForm from '@/components/transactions/TransactionForm';
import { useTransaction } from '@/lib/transactions';
import { useParams, useRouter } from 'next/navigation';

export default function EditTransactionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useTransaction(params?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Editar Transação</h1>
          <button
            onClick={() => router.push('/transactions')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Voltar
          </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {isLoading && <p>Carregando...</p>}
          {!isLoading && data && (
            <TransactionForm
              defaultValues={{
                id: data.id,
                date: data.date,
                description: data.description,
                categoryId: data.categoryId,
                flow: data.flow,
                amount: data.amount,
                accountId: data.accountId,
                cardId: data.cardId,
                planned: data.planned,
                reconciled: data.reconciled,
                merchantId: data.merchantId,
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
