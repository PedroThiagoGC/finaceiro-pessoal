import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateTransactionInput } from '@pwr/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, input: CreateTransactionInput) {
    // Validar se categoria existe e pertence ao usuário
    const category = await this.prisma.category.findFirst({
      where: { id: input.categoryId, userId },
    });
    if (!category) {
      throw new BadRequestException('Categoria não encontrada ou não pertence ao usuário');
    }

    // Validar conta se fornecida
    if (input.accountId) {
      const account = await this.prisma.account.findFirst({
        where: { id: input.accountId, userId },
      });
      if (!account) {
        throw new BadRequestException('Conta não encontrada ou não pertence ao usuário');
      }
    }

    // Validar cartão se fornecido
    if (input.cardId) {
      const card = await this.prisma.card.findFirst({
        where: { id: input.cardId, userId },
      });
      if (!card) {
        throw new BadRequestException('Cartão não encontrado ou não pertence ao usuário');
      }
    }

    // Validar valor positivo
    if (input.amount <= 0) {
      throw new BadRequestException('O valor deve ser maior que zero');
    }

    return this.prisma.transaction.create({
      data: {
        userId,
        date: new Date(input.date),
        description: input.description.trim(),
        merchantId: input.merchantId || null,
        categoryId: input.categoryId,
        flow: input.flow,
        amount: input.amount,
        accountId: input.accountId || null,
        cardId: input.cardId || null,
        planned: input.planned ?? false,
        reconciled: input.reconciled ?? false,
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
      throw new NotFoundException('Transação não encontrada');
    }

    // Validar categoria se fornecida
    if (input.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: input.categoryId, userId },
      });
      if (!category) {
        throw new BadRequestException('Categoria não encontrada ou não pertence ao usuário');
      }
    }

    // Validar conta se fornecida
    if (input.accountId) {
      const account = await this.prisma.account.findFirst({
        where: { id: input.accountId, userId },
      });
      if (!account) {
        throw new BadRequestException('Conta não encontrada ou não pertence ao usuário');
      }
    }

    // Validar cartão se fornecido
    if (input.cardId) {
      const card = await this.prisma.card.findFirst({
        where: { id: input.cardId, userId },
      });
      if (!card) {
        throw new BadRequestException('Cartão não encontrado ou não pertence ao usuário');
      }
    }

    // Validar valor se fornecido
    if (input.amount !== undefined && input.amount <= 0) {
      throw new BadRequestException('O valor deve ser maior que zero');
    }

    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...(input.date && { date: new Date(input.date) }),
        ...(input.description && { description: input.description.trim() }),
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
      throw new NotFoundException('Transação não encontrada');
    }

    return this.prisma.transaction.delete({
      where: { id },
    });
  }

  async reconcile(userId: string, id: string) {
    return this.update(userId, id, { reconciled: true });
  }
}
