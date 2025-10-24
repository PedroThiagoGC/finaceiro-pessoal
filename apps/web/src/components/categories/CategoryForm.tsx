'use client';

import { useCreateCategory, useUpdateCategory } from '@/lib/categories';
import { zodResolver } from '@hookform/resolvers/zod';
import { CategoryTypeEnum, CreateCategoryInput, createCategorySchema } from '@pwr/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export interface CategoryFormProps {
  defaultValues?: Partial<CreateCategoryInput> & { id?: string };
}

export default function CategoryForm({ defaultValues }: CategoryFormProps) {
  const router = useRouter();
  const isEdit = Boolean(defaultValues?.id);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: defaultValues?.name || '',
      type: (defaultValues?.type as any) || 'expense',
      color: defaultValues?.color || '#3b82f6',
    },
  });

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name || '',
        type: (defaultValues.type as any) || 'expense',
        color: defaultValues.color || '#3b82f6',
      });
    }
  }, [defaultValues, reset]);

  const onSubmit = async (data: CreateCategoryInput) => {
    if (isEdit && defaultValues?.id) {
      await updateMutation.mutateAsync({ id: defaultValues.id, payload: data });
    } else {
      await createMutation.mutateAsync(data);
    }
    router.push('/categories');
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
          {CategoryTypeEnum.options.map(opt => (
            <option key={opt} value={opt}>
              {opt === 'expense' && 'Despesa'}
              {opt === 'income' && 'Receita'}
              {opt === 'transfer' && 'Transferência'}
            </option>
          ))}
        </select>
        {errors.type && <p className="text-sm text-red-600">{errors.type.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cor</label>
        <input type="color" className="mt-1 h-10 w-16 p-0 border-0" {...register('color')} />
        {errors.color && <p className="text-sm text-red-600">{errors.color.message as string}</p>}
      </div>

      <div className="pt-2 flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {isEdit ? 'Salvar' : 'Criar Categoria'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/categories')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
