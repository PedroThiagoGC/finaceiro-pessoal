'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

export interface OcrParsedData {
  amount?: number;
  merchant?: string;
  date?: string;
  items?: Array<{ description: string; amount: number }>;
  suggestedCategory?: string;
}

export interface OcrResult {
  rawText: string;
  confidence: number;
  parsed: OcrParsedData;
}

export interface Attachment {
  id: string;
  transactionId: string | null;
  storageKey: string;
  mime: string;
  size: number;
  createdAt: string;
  ocrExtract?: {
    id: string;
    rawText: string;
    parsed: OcrParsedData;
    confidence: number;
    createdAt: string;
  };
}

export interface UploadResult {
  attachmentId: string;
  storageKey: string;
  ocrResult?: OcrResult;
}

/**
 * Faz upload de arquivo e processa OCR
 */
export async function uploadFile(
  file: File,
  transactionId?: string,
  processOcr = true,
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const params = new URLSearchParams();
  if (transactionId) params.append('transactionId', transactionId);
  params.append('processOcr', String(processOcr));

  const queryString = params.toString();
  const url = `/attachments/upload${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${url}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error('Erro ao fazer upload');
  }

  const data = await response.json();
  return data;
}

/**
 * Busca attachment por ID
 */
export async function fetchAttachment(id: string): Promise<Attachment> {
  const response = await api.get<Attachment>(`/attachments/${id}`);
  return response.data;
}

/**
 * Busca attachments de uma transação
 */
export async function fetchAttachmentsByTransaction(
  transactionId: string,
): Promise<Attachment[]> {
  const response = await api.get<Attachment[]>(
    `/attachments/transaction/${transactionId}`,
  );
  return response.data;
}

/**
 * Remove attachment
 */
export async function deleteAttachment(id: string): Promise<void> {
  await api.delete(`/attachments/${id}`);
}

/**
 * Retorna URL para download do arquivo
 */
export function getDownloadUrl(attachmentId: string): string {
  const token = localStorage.getItem('token');
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return `${baseUrl}/attachments/${attachmentId}/download?token=${token}`;
}

// React Query Hooks

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      transactionId,
      processOcr,
    }: {
      file: File;
      transactionId?: string;
      processOcr?: boolean;
    }) => uploadFile(file, transactionId, processOcr),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] });
    },
  });
}

export function useAttachment(id: string) {
  return useQuery({
    queryKey: ['attachments', id],
    queryFn: () => fetchAttachment(id),
    enabled: !!id,
  });
}

export function useAttachmentsByTransaction(transactionId: string) {
  return useQuery({
    queryKey: ['attachments', 'transaction', transactionId],
    queryFn: () => fetchAttachmentsByTransaction(transactionId),
    enabled: !!transactionId,
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAttachment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] });
    },
  });
}
