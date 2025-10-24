import { Module } from '@nestjs/common';
import { OcrModule } from '../ocr/ocr.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';

@Module({
  imports: [PrismaModule, OcrModule],
  controllers: [AttachmentsController],
  providers: [AttachmentsService],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
