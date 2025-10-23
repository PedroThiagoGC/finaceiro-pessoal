import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateCardInput } from '@pwr/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, input: CreateCardInput) {
    // Verificar se já existe um cartão com o mesmo apelido para o usuário
    const existing = await this.prisma.card.findFirst({
      where: {
        userId,
        nickname: input.nickname.trim(),
      },
    });

    if (existing) {
      throw new ConflictException('Já existe um cartão com esse apelido');
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

    // Validações
    if (input.creditLimit <= 0) {
      throw new BadRequestException('O limite de crédito deve ser maior que zero');
    }

    if (input.billingDay < 1 || input.billingDay > 31) {
      throw new BadRequestException('O dia de fechamento deve estar entre 1 e 31');
    }

    if (input.dueDay < 1 || input.dueDay > 31) {
      throw new BadRequestException('O dia de vencimento deve estar entre 1 e 31');
    }

    return this.prisma.card.create({
      data: {
        userId,
        accountId: input.accountId || null,
        brand: input.brand.trim(),
        nickname: input.nickname.trim(),
        creditLimit: input.creditLimit,
        billingDay: input.billingDay,
        dueDay: input.dueDay,
      },
      include: { account: true },
    });
  }

  async findAll(userId: string) {
    return this.prisma.card.findMany({
      where: { userId },
      include: {
        account: true,
        _count: {
          select: {
            transactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const card = await this.prisma.card.findFirst({
      where: { id, userId },
      include: {
        account: true,
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }

    return card;
  }

  async update(userId: string, id: string, input: Partial<CreateCardInput>) {
    const existing = await this.prisma.card.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Cartão não encontrado');
    }

    // Se está alterando o apelido, verificar se não há conflito
    if (input.nickname && input.nickname.trim() !== existing.nickname) {
      const duplicate = await this.prisma.card.findFirst({
        where: {
          userId,
          nickname: input.nickname.trim(),
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new ConflictException('Já existe um cartão com esse apelido');
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

    // Validações
    if (input.creditLimit !== undefined && input.creditLimit <= 0) {
      throw new BadRequestException('O limite de crédito deve ser maior que zero');
    }

    if (input.billingDay !== undefined && (input.billingDay < 1 || input.billingDay > 31)) {
      throw new BadRequestException('O dia de fechamento deve estar entre 1 e 31');
    }

    if (input.dueDay !== undefined && (input.dueDay < 1 || input.dueDay > 31)) {
      throw new BadRequestException('O dia de vencimento deve estar entre 1 e 31');
    }

    return this.prisma.card.update({
      where: { id },
      data: {
        ...(input.accountId !== undefined && { accountId: input.accountId }),
        ...(input.brand && { brand: input.brand.trim() }),
        ...(input.nickname && { nickname: input.nickname.trim() }),
        ...(input.creditLimit !== undefined && { creditLimit: input.creditLimit }),
        ...(input.billingDay !== undefined && { billingDay: input.billingDay }),
        ...(input.dueDay !== undefined && { dueDay: input.dueDay }),
      },
      include: { account: true },
    });
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.card.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Cartão não encontrado');
    }

    // Verificar se o cartão tem transações associadas
    if (existing._count.transactions > 0) {
      throw new BadRequestException(
        'Não é possível excluir um cartão com transações associadas. Exclua as transações primeiro.',
      );
    }

    return this.prisma.card.delete({
      where: { id },
    });
  }

  async getInvoice(userId: string, cardId: string, month: string) {
    const card = await this.findOne(userId, cardId);
    if (!card) throw new Error('Cartão não encontrado');

    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, card.billingDay);
    const endDate = new Date(year, monthNum, card.billingDay);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        cardId,
        date: {
          gte: startDate,
          lt: endDate,
        },
        flow: 'expense',
      },
      include: { category: true },
    });

    const total = transactions.reduce((acc, tx) => acc + tx.amount, 0);

    return {
      card,
      month,
      transactions,
      total,
      dueDate: new Date(year, monthNum - 1, card.dueDay),
    };
  }
}
