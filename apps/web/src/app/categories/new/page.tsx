'use client';

import CategoryForm from '@/components/categories/CategoryForm';
import { useRouter } from 'next/navigation';

export default function NewCategoryPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Nova Categoria</h1>
          <button
            onClick={() => router.push('/categories')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Voltar
          </button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <CategoryForm />
        </div>
      </main>
    </div>
  );
}
