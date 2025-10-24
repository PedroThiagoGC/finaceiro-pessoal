import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface StorageAdapter {
  upload(
    file: Buffer,
    filename: string,
    mimetype: string,
  ): Promise<{ storageKey: string; publicUrl: string }>;
  
  download(storageKey: string): Promise<Buffer>;
  
  delete(storageKey: string): Promise<void>;
  
  getPublicUrl(storageKey: string): string;
}

@Injectable()
export class SupabaseStorageAdapter implements StorageAdapter {
  private supabase: SupabaseClient;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    this.bucketName = this.configService.get<string>('SUPABASE_STORAGE_BUCKET') || 'pwr-attachments';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
  }

  /**
   * Faz upload de arquivo para Supabase Storage
   */
  async upload(
    file: Buffer,
    filename: string,
    mimetype: string,
  ): Promise<{ storageKey: string; publicUrl: string }> {
    const storageKey = `${Date.now()}-${filename}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(storageKey, file, {
        contentType: mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Erro ao fazer upload para Supabase Storage:', error);
      throw new InternalServerErrorException('Falha ao fazer upload do arquivo');
    }

    const publicUrl = this.getPublicUrl(data.path);

    return { storageKey: data.path, publicUrl };
  }

  /**
   * Baixa arquivo do Supabase Storage
   */
  async download(storageKey: string): Promise<Buffer> {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .download(storageKey);

    if (error) {
      console.error('Erro ao baixar arquivo do Supabase Storage:', error);
      throw new InternalServerErrorException('Falha ao baixar arquivo');
    }

    return Buffer.from(await data.arrayBuffer());
  }

  /**
   * Remove arquivo do Supabase Storage
   */
  async delete(storageKey: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([storageKey]);

    if (error) {
      console.error('Erro ao remover arquivo do Supabase Storage:', error);
      // Não lança erro para não bloquear remoção do registro no banco
    }
  }

  /**
   * Retorna URL pública do arquivo
   */
  getPublicUrl(storageKey: string): string {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(storageKey);

    return data.publicUrl;
  }
}
