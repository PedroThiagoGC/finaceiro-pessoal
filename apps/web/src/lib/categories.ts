import { Category, CategoryType, CreateCategoryInput } from '@pwr/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './api';

export type CategoryListItem = {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
};

export async function fetchCategories(): Promise<CategoryListItem[]> {
  const res = await api.get('/categories');
  return res.data.data;
}

export async function fetchCategory(id: string): Promise<Category> {
  const res = await api.get(`/categories/${id}`);
  return res.data.data;
}

export async function createCategory(payload: CreateCategoryInput): Promise<Category> {
  const res = await api.post('/categories', payload);
  return res.data.data;
}

export async function updateCategory(id: string, payload: Partial<CreateCategoryInput>): Promise<Category> {
  const res = await api.put(`/categories/${id}`, payload);
  return res.data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
}

export function useCategory(id?: string) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => fetchCategory(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateCategoryInput> }) =>
      api.put(`/categories/${id}`, payload).then(res => res.data.data as Category),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['categories', variables.id] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}
