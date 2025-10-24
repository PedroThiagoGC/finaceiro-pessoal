'use client';

import { FileUpload } from '@/components/attachments/FileUpload';
import { useAccounts } from '@/lib/accounts';
import { OcrResult } from '@/lib/attachments';
import { useCards } from '@/lib/cards';
import { useCategories } from '@/lib/categories';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function TransactionUploadPage() {
  const router = useRouter();
  const [ocrData, setOcrData] = useState<OcrResult | null>(null);
  const [attachmentId, setAttachmentId] = useState<string | null>(null);

  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();
  const { data: cards } = useCards();

  const handleUploadComplete = (result: {
    attachmentId: string;
    ocrResult?: OcrResult;
  }) => {
    setAttachmentId(result.attachmentId);
    if (result.ocrResult) {
      setOcrData(result.ocrResult);
    }
  };

  const handleCreateTransaction = () => {
    // Navega para página de nova transação com dados pré-preenchidos via query params
    const params = new URLSearchParams();
    if (attachmentId) params.append('attachmentId', attachmentId);
    if (ocrData?.parsed.amount) params.append('amount', String(ocrData.parsed.amount));
    if (ocrData?.parsed.merchant) params.append('description', ocrData.parsed.merchant);
    if (ocrData?.parsed.date) params.append('date', ocrData.parsed.date);
    if (ocrData?.parsed.suggestedCategory) {
      const category = categories?.find(
        c => c.name.toLowerCase() === ocrData.parsed.suggestedCategory?.toLowerCase()
      );
      if (category) params.append('categoryId', category.id);
    }

    router.push(`/transactions/new?${params.toString()}`);
  };

  const suggestedCategory = categories?.find(
    c => c.name.toLowerCase() === ocrData?.parsed.suggestedCategory?.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Upload de Comprovante (OCR)
          </h1>
          <button
            onClick={() => router.push('/transactions')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Voltar
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
              1. Envie uma imagem do comprovante
            </h2>
            <FileUpload
              onUploadComplete={handleUploadComplete}
              processOcr={true}
            />
          </div>

          {/* Resultado OCR */}
          {ocrData && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                2. Dados extraídos automaticamente
              </h2>

              <div className="space-y-4">
                {/* Confiança */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Confiança do OCR:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                    <div
                      className={`bg-blue-600 h-2 rounded-full transition-all ${
                        ocrData.confidence >= 90
                          ? 'w-full'
                          : ocrData.confidence >= 80
                          ? 'w-11/12'
                          : ocrData.confidence >= 70
                          ? 'w-5/6'
                          : ocrData.confidence >= 60
                          ? 'w-3/4'
                          : ocrData.confidence >= 50
                          ? 'w-2/3'
                          : ocrData.confidence >= 40
                          ? 'w-1/2'
                          : ocrData.confidence >= 30
                          ? 'w-1/3'
                          : 'w-1/4'
                      }`}
                    ></div>
                  </div>
                  <span className="text-gray-600">
                    {ocrData.confidence.toFixed(1)}%
                  </span>
                </div>

                {/* Dados extraídos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {ocrData.parsed.amount && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Valor</p>
                      <p className="text-2xl font-bold text-green-700">
                        R$ {ocrData.parsed.amount.toFixed(2)}
                      </p>
                    </div>
                  )}

                  {ocrData.parsed.merchant && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Estabelecimento</p>
                      <p className="text-lg font-semibold text-blue-700">
                        {ocrData.parsed.merchant}
                      </p>
                    </div>
                  )}

                  {ocrData.parsed.date && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600">Data</p>
                      <p className="text-lg font-semibold text-purple-700">
                        {ocrData.parsed.date}
                      </p>
                    </div>
                  )}

                  {ocrData.parsed.suggestedCategory && (
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-gray-600">Categoria Sugerida</p>
                      <div className="flex items-center gap-2">
                        {suggestedCategory && (
                          <svg
                            className="w-4 h-4"
                            fill={suggestedCategory.color}
                            viewBox="0 0 8 8"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="4" cy="4" r="4" />
                          </svg>
                        )}
                        <p className="text-lg font-semibold text-yellow-700">
                          {ocrData.parsed.suggestedCategory}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Itens */}
                {ocrData.parsed.items && ocrData.parsed.items.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Itens identificados:</h3>
                    <div className="border rounded-lg divide-y">
                      {ocrData.parsed.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 flex justify-between items-center"
                        >
                          <span className="text-gray-700">{item.description}</span>
                          <span className="font-semibold">
                            R$ {item.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Texto bruto */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                    Ver texto completo extraído
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-100 rounded text-xs whitespace-pre-wrap">
                    {ocrData.rawText}
                  </pre>
                </details>

                {/* Botão criar transação */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleCreateTransaction}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Criar Transação com esses dados →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
