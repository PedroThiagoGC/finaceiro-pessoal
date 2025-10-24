'use client';

import { useAccounts } from '@/lib/accounts';
import { useCreateCard, useUpdateCard } from '@/lib/cards';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCardInput, createCardSchema } from '@pwr/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export interface CardFormProps {
  defaultValues?: Partial<CreateCardInput> & { id?: string };
}

export default function CardForm({ defaultValues }: CardFormProps) {
  const router = useRouter();
  const isEdit = Boolean(defaultValues?.id);
  const { data: accounts } = useAccounts();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateCardInput>({
    resolver: zodResolver(createCardSchema),
    defaultValues: {
      accountId: defaultValues?.accountId || null,
      brand: defaultValues?.brand || '',
      nickname: defaultValues?.nickname || '',
      creditLimit: defaultValues?.creditLimit ?? 0,
      billingDay: defaultValues?.billingDay ?? 1,
      dueDay: defaultValues?.dueDay ?? 10,
    },
  });

  const createMutation = useCreateCard();
  const updateMutation = useUpdateCard();

  useEffect(() => {
    if (defaultValues) {
      reset({
        accountId: defaultValues.accountId || null,
        brand: defaultValues.brand || '',
        nickname: defaultValues.nickname || '',
        creditLimit: defaultValues.creditLimit ?? 0,
        billingDay: defaultValues.billingDay ?? 1,
        dueDay: defaultValues.dueDay ?? 10,
      });
    }
  }, [defaultValues, reset]);

  const onSubmit = async (data: CreateCardInput) => {
    if (isEdit && defaultValues?.id) {
      await updateMutation.mutateAsync({ id: defaultValues.id, payload: data });
    } else {
      await createMutation.mutateAsync(data);
    }
    router.push('/cards');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Conta de Pagamento (opcional)</label>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          {...register('accountId')}
        >
          <option value="">Sem conta vinculada</option>
          {accounts?.map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>
        {errors.accountId && <p className="text-sm text-red-600">{errors.accountId.message as string}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Bandeira</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            {...register('brand')}
          />
          {errors.brand && <p className="text-sm text-red-600">{errors.brand.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Apelido</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            {...register('nickname')}
          />
          {errors.nickname && <p className="text-sm text-red-600">{errors.nickname.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Limite</label>
          <input
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            {...register('creditLimit', { valueAsNumber: true })}
          />
          {errors.creditLimit && (
            <p className="text-sm text-red-600">{errors.creditLimit.message as string}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Dia de Fechamento</label>
          <input
            type="number"
            min={1}
            max={31}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            {...register('billingDay', { valueAsNumber: true })}
          />
          {errors.billingDay && (
            <p className="text-sm text-red-600">{errors.billingDay.message as string}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Dia de Vencimento</label>
          <input
            type="number"
            min={1}
            max={31}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            {...register('dueDay', { valueAsNumber: true })}
          />
          {errors.dueDay && <p className="text-sm text-red-600">{errors.dueDay.message as string}</p>}
        </div>
      </div>

      <div className="pt-2 flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {isEdit ? 'Salvar' : 'Criar Cartão'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/cards')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
