'use client';

import { useCreateAccount, useUpdateAccount } from '@/lib/accounts';
import { zodResolver } from '@hookform/resolvers/zod';
import { AccountTypeEnum, CreateAccountInput, createAccountSchema } from '@pwr/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export interface AccountFormProps {
  defaultValues?: Partial<CreateAccountInput> & { id?: string };
}

export default function AccountForm({ defaultValues }: AccountFormProps) {
  const router = useRouter();
  const isEdit = Boolean(defaultValues?.id);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateAccountInput>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      type: (defaultValues?.type as any) || 'checking',
      openingBalance: defaultValues?.openingBalance ?? 0,
      currency: defaultValues?.currency || 'BRL',
    },
  });

  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name || '',
        type: (defaultValues.type as any) || 'checking',
        openingBalance: defaultValues.openingBalance ?? 0,
        currency: defaultValues.currency || 'BRL',
      });
    }
  }, [defaultValues, reset]);

  const onSubmit = async (data: CreateAccountInput) => {
    if (isEdit && defaultValues?.id) {
      await updateMutation.mutateAsync({ id: defaultValues.id, payload: data });
    } else {
      await createMutation.mutateAsync(data);
    }
    router.push('/accounts');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome</label>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          {...register('name')}
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tipo</label>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          {...register('type')}
        >
          {AccountTypeEnum.options.map(opt => (
            <option key={opt} value={opt}>
              {opt === 'checking' && 'Conta Corrente'}
              {opt === 'savings' && 'Poupança'}
              {opt === 'cash' && 'Dinheiro'}
              {opt === 'other' && 'Outros'}
            </option>
          ))}
        </select>
        {errors.type && <p className="text-sm text-red-600">{errors.type.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Saldo Inicial</label>
        <input
          type="number"
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          {...register('openingBalance', { valueAsNumber: true })}
        />
        {errors.openingBalance && (
          <p className="text-sm text-red-600">{errors.openingBalance.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Moeda</label>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          {...register('currency')}
        />
        {errors.currency && <p className="text-sm text-red-600">{errors.currency.message}</p>}
      </div>

      <div className="pt-2 flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {isEdit ? 'Salvar' : 'Criar Conta'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/accounts')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
