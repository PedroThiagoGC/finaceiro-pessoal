import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { OcrService } from '../ocr/ocr.service';
import { PrismaService } from '../prisma/prisma.service';

export interface UploadResult {
  attachmentId: string;
  storageKey: string;
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

  constructor(
    private prisma: PrismaService,
    private ocrService: OcrService,
  ) {
    this.ensureUploadDir();
  }

  /**
   * Garante que o diretório de uploads existe
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
    const storageKey = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.uploadDir, storageKey);

    // Salva arquivo
    await fs.writeFile(filePath, file.buffer);

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
      ['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)
    ) {
      try {
        const extracted = await this.ocrService.extractText(filePath);

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
      } catch (error) {
        console.error('Erro ao processar OCR:', error);
      }
    }

    return {
      attachmentId: attachment.id,
      storageKey: attachment.storageKey,
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
    const filePath = path.join(this.uploadDir, attachment.storageKey);

    const buffer = await fs.readFile(filePath);

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
    const filePath = path.join(this.uploadDir, attachment.storageKey);

    // Remove arquivo físico
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Erro ao remover arquivo:', error);
    }

    // Remove do banco
    await this.prisma.attachment.delete({
      where: { id: attachmentId },
    });

    return { message: 'Attachment removido com sucesso' };
  }
}
