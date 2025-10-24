'use client';

import Link from 'next/link';

export default function NewTransactionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Nova Transação</h1>
          <Link href="/dashboard" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Voltar
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 text-gray-600">
          <p>Formulário de transação em desenvolvimento. Em breve você poderá lançar despesas e receitas aqui.</p>
        </div>
      </main>
    </div>
  );
}
