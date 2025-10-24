import {
    BadRequestException,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    Request,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    FileInterceptor,
} from '@nestjs/platform-express';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AttachmentsService } from './attachments.service';

@ApiTags('attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Faz upload de arquivo e processa OCR' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo (imagem/PDF)',
        },
        transactionId: {
          type: 'string',
          description: 'ID da transação (opcional)',
        },
        processOcr: {
          type: 'boolean',
          description: 'Processar OCR (padrão: true)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Arquivo enviado com sucesso',
    schema: {
      type: 'object',
      properties: {
        attachmentId: { type: 'string' },
        storageKey: { type: 'string' },
        ocrResult: {
          type: 'object',
          properties: {
            rawText: { type: 'string' },
            confidence: { type: 'number' },
            parsed: {
              type: 'object',
              properties: {
                amount: { type: 'number' },
                merchant: { type: 'string' },
                date: { type: 'string' },
                suggestedCategory: { type: 'string' },
                items: { type: 'array' },
              },
            },
          },
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Query('transactionId') transactionId?: string,
    @Query('processOcr') processOcr?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    const userId = req.user.userId;
    const shouldProcessOcr = processOcr !== 'false';

    return this.attachmentsService.uploadFile(
      userId,
      file,
      transactionId,
      shouldProcessOcr,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca attachment por ID' })
  @ApiResponse({
    status: 200,
    description: 'Retorna informações do attachment',
  })
  async findOne(@Param('id') id: string) {
    return this.attachmentsService.findOne(id);
  }

  @Get('transaction/:transactionId')
  @ApiOperation({ summary: 'Busca attachments de uma transação' })
  @ApiResponse({
    status: 200,
    description: 'Retorna lista de attachments',
  })
  async findByTransaction(@Param('transactionId') transactionId: string) {
    return this.attachmentsService.findByTransaction(transactionId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Faz download do arquivo' })
  @ApiResponse({
    status: 200,
    description: 'Retorna arquivo para download',
  })
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const { buffer, mime, filename } = await this.attachmentsService.getFile(
      id,
    );

    res.set({
      'Content-Type': mime,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    res.send(buffer);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove attachment' })
  @ApiResponse({
    status: 200,
    description: 'Attachment removido com sucesso',
  })
  async remove(@Param('id') id: string) {
    return this.attachmentsService.remove(id);
  }
}
