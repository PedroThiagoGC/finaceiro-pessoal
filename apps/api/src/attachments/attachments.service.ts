import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { OcrService } from '../ocr/ocr.service';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseStorageAdapter } from './storage.adapter';

export interface UploadResult {
  attachmentId: string;
  storageKey: string;
  publicUrl?: string;
  ocrResult?: {
    rawText: string;
    confidence: number;
    parsed: {
      amount?: number;
      merchant?: string;
      date?: string;
      items?: Array<{ description: string; amount: number }>;
      suggestedCategory?: string;
    };
  };
}

@Injectable()
export class AttachmentsService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly useSupabase: boolean;
  private storageAdapter?: SupabaseStorageAdapter;

  constructor(
    private prisma: PrismaService,
    private ocrService: OcrService,
    private configService: ConfigService,
  ) {
    // Usa Supabase se as credenciais estiverem disponíveis, caso contrário usa filesystem
    this.useSupabase = !!(
      this.configService.get('NEXT_PUBLIC_SUPABASE_URL') &&
      this.configService.get('SUPABASE_SERVICE_ROLE_KEY')
    );

    if (this.useSupabase) {
      this.storageAdapter = new SupabaseStorageAdapter(configService);
    } else {
      this.ensureUploadDir();
    }
  }

  /**
   * Garante que o diretório de uploads existe (fallback filesystem)
   */
  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Faz upload de arquivo e opcionalmente processa com OCR
   */
  async uploadFile(
    userId: string,
    file: Express.Multer.File,
    transactionId?: string,
    processOcr = true,
  ): Promise<UploadResult> {
    let storageKey: string;
    let publicUrl: string | undefined;
    let tempFilePath: string | undefined;

    // Upload para Supabase ou filesystem
    if (this.useSupabase && this.storageAdapter) {
      const uploaded = await this.storageAdapter.upload(
        file.buffer,
        file.originalname,
        file.mimetype,
      );
      storageKey = uploaded.storageKey;
      publicUrl = uploaded.publicUrl;

      // Para OCR, precisamos salvar temporariamente
      if (
        processOcr &&
        ['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)
      ) {
        tempFilePath = path.join(this.uploadDir, `temp-${storageKey}`);
        await this.ensureUploadDir();
        await fs.writeFile(tempFilePath, file.buffer);
      }
    } else {
      // Fallback: filesystem local
      storageKey = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(this.uploadDir, storageKey);
      await fs.writeFile(filePath, file.buffer);
      tempFilePath = filePath;
    }

    // Cria registro de attachment
    const attachment = await this.prisma.attachment.create({
      data: {
        transactionId: transactionId || null,
        storageKey,
        mime: file.mimetype,
        size: file.size,
      },
    });

    let ocrResult;

    // Processa OCR se for imagem
    if (
      processOcr &&
      tempFilePath &&
      ['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)
    ) {
      try {
        const extracted = await this.ocrService.extractText(tempFilePath);

        // Salva resultado do OCR
        await this.prisma.ocrExtract.create({
          data: {
            attachmentId: attachment.id,
            rawText: extracted.rawText,
            parsed: extracted.parsed as any,
            confidence: extracted.confidence,
          },
        });

        ocrResult = extracted;

        // Remove arquivo temporário se usou Supabase
        if (this.useSupabase) {
          await fs.unlink(tempFilePath).catch(() => {});
        }
      } catch (error) {
        console.error('Erro ao processar OCR:', error);
        // Remove temp file em caso de erro
        if (this.useSupabase && tempFilePath) {
          await fs.unlink(tempFilePath).catch(() => {});
        }
      }
    }

    return {
      attachmentId: attachment.id,
      storageKey: attachment.storageKey,
      publicUrl,
      ocrResult,
    };
  }

  /**
   * Busca attachment por ID
   */
  async findOne(attachmentId: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { ocrExtract: true },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment não encontrado');
    }

    return attachment;
  }

  /**
   * Busca attachments de uma transação
   */
  async findByTransaction(transactionId: string) {
    return this.prisma.attachment.findMany({
      where: { transactionId },
      include: { ocrExtract: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Retorna arquivo para download
   */
  async getFile(attachmentId: string): Promise<{
    buffer: Buffer;
    mime: string;
    filename: string;
  }> {
    const attachment = await this.findOne(attachmentId);
    let buffer: Buffer;

    if (this.useSupabase && this.storageAdapter) {
      buffer = await this.storageAdapter.download(attachment.storageKey);
    } else {
      const filePath = path.join(this.uploadDir, attachment.storageKey);
      buffer = await fs.readFile(filePath);
    }

    return {
      buffer,
      mime: attachment.mime,
      filename: attachment.storageKey,
    };
  }

  /**
   * Remove attachment
   */
  async remove(attachmentId: string) {
    const attachment = await this.findOne(attachmentId);

    // Remove arquivo físico ou do Supabase
    if (this.useSupabase && this.storageAdapter) {
      await this.storageAdapter.delete(attachment.storageKey);
    } else {
      const filePath = path.join(this.uploadDir, attachment.storageKey);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Erro ao remover arquivo:', error);
      }
    }

    // Remove do banco
    await this.prisma.attachment.delete({
      where: { id: attachmentId },
    });

    return { message: 'Attachment removido com sucesso' };
  }
}
