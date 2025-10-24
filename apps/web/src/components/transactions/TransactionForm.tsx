'use client';

import { useAccounts } from '@/lib/accounts';
import { useCards } from '@/lib/cards';
import { useCategories } from '@/lib/categories';
import { useCreateTransaction, useUpdateTransaction } from '@/lib/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateTransactionInput, Flow } from '@pwr/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Schema estendido com validação condicional
const transactionFormSchema = z
  .object({
    date: z.string().min(1, 'Data é obrigatória'),
    description: z.string().min(1, 'Descrição é obrigatória'),
    categoryId: z.string().uuid('Categoria é obrigatória'),
    flow: z.enum(['expense', 'income', 'transfer']),
    amount: z.number().positive('Valor deve ser positivo'),
    accountId: z.string().uuid().nullable().optional(),
    cardId: z.string().uuid().nullable().optional(),
    planned: z.boolean().default(false),
    reconciled: z.boolean().default(false),
  })
  .refine(
    data => {
      // Se for despesa, precisa ter accountId OU cardId
      if (data.flow === 'expense') {
        return Boolean(data.accountId || data.cardId);
      }
      // Se for receita ou transferência, precisa ter accountId
      return Boolean(data.accountId);
    },
    {
      message: 'Despesas precisam de conta ou cartão. Receitas/Transferências precisam de conta.',
      path: ['accountId'],
    },
  );

type TransactionFormData = z.infer<typeof transactionFormSchema>;

export interface TransactionFormProps {
  defaultValues?: Partial<CreateTransactionInput> & { id?: string };
}

export default function TransactionForm({ defaultValues }: TransactionFormProps) {
  const router = useRouter();
  const isEdit = Boolean(defaultValues?.id);

  const { data: accounts } = useAccounts();
  const { data: cards } = useCards();
  const { data: categories } = useCategories();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      date: defaultValues?.date
        ? new Date(defaultValues.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      description: defaultValues?.description || '',
      categoryId: defaultValues?.categoryId || '',
      flow: defaultValues?.flow || 'expense',
      amount: defaultValues?.amount ?? 0,
      accountId: defaultValues?.accountId || null,
      cardId: defaultValues?.cardId || null,
      planned: defaultValues?.planned ?? false,
      reconciled: defaultValues?.reconciled ?? false,
    },
  });

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const flow = watch('flow');
  const cardId = watch('cardId');

  // Quando selecionar cartão, limpar conta (e vice-versa para despesas)
  useEffect(() => {
    if (flow === 'expense' && cardId) {
      setValue('accountId', null);
    }
  }, [cardId, flow, setValue]);

  useEffect(() => {
    if (defaultValues) {
      reset({
        date: defaultValues.date
          ? new Date(defaultValues.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        description: defaultValues.description || '',
        categoryId: defaultValues.categoryId || '',
        flow: defaultValues.flow || 'expense',
        amount: defaultValues.amount ?? 0,
        accountId: defaultValues.accountId || null,
        cardId: defaultValues.cardId || null,
        planned: defaultValues.planned ?? false,
        reconciled: defaultValues.reconciled ?? false,
      });
    }
  }, [defaultValues, reset]);

  const onSubmit = async (data: TransactionFormData) => {
    const payload: CreateTransactionInput = {
      date: data.date,
      description: data.description,
      categoryId: data.categoryId,
      flow: data.flow as Flow,
      amount: data.amount,
      accountId: data.accountId || null,
      cardId: data.cardId || null,
      planned: data.planned,
      reconciled: data.reconciled,
      merchantId: null,
    };

    if (isEdit && defaultValues?.id) {
      await updateMutation.mutateAsync({ id: defaultValues.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    router.push('/transactions');
  };

  // Filtrar categorias pelo tipo de flow
  const filteredCategories = categories?.filter(cat => {
    if (flow === 'transfer') return cat.type === 'transfer';
    if (flow === 'expense') return cat.type === 'expense';
    if (flow === 'income') return cat.type === 'income';
    return true;
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Data */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Data</label>
          <input
            type="date"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            {...register('date')}
          />
          {errors.date && <p className="text-sm text-red-600">{errors.date.message}</p>}
        </div>

        {/* Tipo (Flow) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            {...register('flow')}
          >
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
            <option value="transfer">Transferência</option>
          </select>
          {errors.flow && <p className="text-sm text-red-600">{errors.flow.message}</p>}
        </div>
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Descrição</label>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          {...register('description')}
        />
        {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Valor */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Valor</label>
          <input
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            {...register('amount', { valueAsNumber: true })}
          />
          {errors.amount && <p className="text-sm text-red-600">{errors.amount.message}</p>}
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Categoria</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            {...register('categoryId')}
          >
            <option value="">Selecione uma categoria</option>
            {filteredCategories?.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="text-sm text-red-600">{errors.categoryId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Conta (sempre disponível, mas opcional para despesas se tiver cartão) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Conta {flow === 'expense' ? '(ou cartão)' : '*'}
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            {...register('accountId')}
            disabled={flow === 'expense' && Boolean(cardId)}
          >
            <option value="">Selecione uma conta</option>
            {accounts?.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
          {errors.accountId && <p className="text-sm text-red-600">{errors.accountId.message}</p>}
        </div>

        {/* Cartão (apenas para despesas) */}
        {flow === 'expense' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Cartão (opcional)</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              {...register('cardId')}
            >
              <option value="">Sem cartão</option>
              {cards?.map(card => (
                <option key={card.id} value={card.id}>
                  {card.nickname} ({card.brand})
                </option>
              ))}
            </select>
            {errors.cardId && <p className="text-sm text-red-600">{errors.cardId.message}</p>}
          </div>
        )}
      </div>

      {/* Checkboxes */}
      <div className="flex gap-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="planned"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            {...register('planned')}
          />
          <label htmlFor="planned" className="ml-2 block text-sm text-gray-700">
            Planejada
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="reconciled"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            {...register('reconciled')}
          />
          <label htmlFor="reconciled" className="ml-2 block text-sm text-gray-700">
            Conciliada
          </label>
        </div>
      </div>

      {/* Botões */}
      <div className="pt-4 flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isEdit ? 'Salvar' : 'Criar Transação'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/transactions')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
