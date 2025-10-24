'use client';

import TransactionForm from '@/components/transactions/TransactionForm';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export default function NewTransactionPage() {
  const searchParams = useSearchParams();

  // Lê dados do OCR dos query params
  const defaultValues = useMemo(() => {
    const amount = searchParams.get('amount');
    const description = searchParams.get('description');
    const date = searchParams.get('date');
    const categoryId = searchParams.get('categoryId');
    const attachmentId = searchParams.get('attachmentId');

    const values: any = {};

    if (amount) values.amount = parseFloat(amount);
    if (description) values.description = description;
    if (date) {
      // Tenta converter data dd/mm/yyyy para yyyy-mm-dd
      const parts = date.split(/[\/\-\.]/);
      if (parts.length === 3) {
        const [day, month, year] = parts;
        values.date = `${year.length === 2 ? '20' + year : year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    if (categoryId) values.categoryId = categoryId;
    if (attachmentId) values.attachmentId = attachmentId;

    // Se tem dados do OCR, define flow como expense por padrão
    if (amount || description) {
      values.flow = 'expense';
    }

    return Object.keys(values).length > 0 ? values : undefined;
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Nova Transação</h1>
          <div className="flex gap-2">
            <Link
              href="/transactions/upload"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              📷 Upload OCR
            </Link>
            <Link
              href="/transactions"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Voltar
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {defaultValues && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              ✅ Dados preenchidos automaticamente pelo OCR
            </p>
            <p className="text-sm text-green-700 mt-1">
              Revise os dados antes de salvar a transação.
            </p>
          </div>
        )}
        <div className="bg-white rounded-lg shadow p-6">
          <TransactionForm defaultValues={defaultValues} />
        </div>
      </main>
    </div>
  );
}
