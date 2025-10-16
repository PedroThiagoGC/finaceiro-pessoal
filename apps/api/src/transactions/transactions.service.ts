import { Injectable } from '@nestjs/common';
import type { CreateTransactionInput } from '@pwr/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, input: CreateTransactionInput) {
    return this.prisma.transaction.create({
      data: {
        userId,
        date: new Date(input.date),
        description: input.description,
        merchantId: input.merchantId,
        categoryId: input.categoryId,
        flow: input.flow,
        amount: input.amount,
        accountId: input.accountId,
        cardId: input.cardId,
        planned: input.planned,
        reconciled: input.reconciled,
      },
      include: {
        category: true,
        merchant: true,
        account: true,
        card: true,
      },
    });
  }

  async findAll(userId: string, filters?: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    cardId?: string;
    accountId?: string;
    flow?: string;
  }) {
    const where: any = { userId };

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.cardId) where.cardId = filters.cardId;
    if (filters?.accountId) where.accountId = filters.accountId;
    if (filters?.flow) where.flow = filters.flow;

    return this.prisma.transaction.findMany({
      where,
      include: {
        category: true,
        merchant: true,
        account: true,
        card: true,
        attachments: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    return this.prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        category: true,
        merchant: true,
        account: true,
        card: true,
        attachments: {
          include: {
            ocrExtract: true,
          },
        },
      },
    });
  }

  async update(userId: string, id: string, input: Partial<CreateTransactionInput>) {
    // Verify ownership
    const existing = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Transação não encontrada');
    }

    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...(input.date && { date: new Date(input.date) }),
        ...(input.description && { description: input.description }),
        ...(input.merchantId !== undefined && { merchantId: input.merchantId }),
        ...(input.categoryId && { categoryId: input.categoryId }),
        ...(input.flow && { flow: input.flow }),
        ...(input.amount !== undefined && { amount: input.amount }),
        ...(input.accountId !== undefined && { accountId: input.accountId }),
        ...(input.cardId !== undefined && { cardId: input.cardId }),
        ...(input.planned !== undefined && { planned: input.planned }),
        ...(input.reconciled !== undefined && { reconciled: input.reconciled }),
      },
      include: {
        category: true,
        merchant: true,
        account: true,
        card: true,
      },
    });
  }

  async remove(userId: string, id: string) {
    // Verify ownership
    const existing = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Transação não encontrada');
    }

    return this.prisma.transaction.delete({
      where: { id },
    });
  }

  async reconcile(userId: string, id: string) {
    return this.update(userId, id, { reconciled: true });
  }
}
