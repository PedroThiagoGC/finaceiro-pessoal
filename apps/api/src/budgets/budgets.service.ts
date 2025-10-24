import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type BudgetPeriod = 'monthly' | 'quarterly' | 'annual';

export interface CreateBudgetDto {
  period: BudgetPeriod;
  year: number;
  month?: number;
  categoryId?: string;
  amount: number;
}

export interface UpdateBudgetDto {
  period?: BudgetPeriod;
  year?: number;
  month?: number;
  categoryId?: string;
  amount?: number;
}

export interface BudgetProgress {
  budgetId: string;
  period: BudgetPeriod;
  year: number;
  month?: number;
  categoryName?: string;
  budgetedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentUsed: number;
  status: 'safe' | 'warning' | 'exceeded';
}

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Cria um novo orçamento
   */
  async create(userId: string, data: CreateBudgetDto) {
    // Valida mês para período mensal
    if (data.period === 'monthly' && !data.month) {
      throw new Error('Mês é obrigatório para período mensal');
    }

    // Verifica duplicação
    const existing = await this.prisma.budget.findFirst({
      where: {
        userId,
        period: data.period,
        year: data.year,
        month: data.month || null,
        categoryId: data.categoryId || null,
      },
    });

    if (existing) {
      throw new Error('Já existe um orçamento para este período e categoria');
    }

    return this.prisma.budget.create({
      data: {
        userId,
        ...data,
        categoryId: data.categoryId || null,
      },
      include: {
        category: true,
      },
    });
  }

  /**
   * Lista orçamentos do usuário
   */
  async findAll(
    userId: string,
    filters?: {
      period?: BudgetPeriod;
      year?: number;
      month?: number;
      categoryId?: string;
    },
  ) {
    return this.prisma.budget.findMany({
      where: {
        userId,
        ...(filters?.period && { period: filters.period }),
        ...(filters?.year && { year: filters.year }),
        ...(filters?.month && { month: filters.month }),
        ...(filters?.categoryId && { categoryId: filters.categoryId }),
      },
      include: {
        category: true,
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  /**
   * Busca orçamento por ID
   */
  async findOne(userId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
      include: {
        category: true,
      },
    });

    if (!budget) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    return budget;
  }

  /**
   * Atualiza orçamento
   */
  async update(userId: string, id: string, data: UpdateBudgetDto) {
    await this.findOne(userId, id);

    return this.prisma.budget.update({
      where: { id },
      data: {
        ...(data.period && { period: data.period }),
        ...(data.year && { year: data.year }),
        ...(data.month !== undefined && { month: data.month }),
        ...(data.categoryId !== undefined && {
          categoryId: data.categoryId || null,
        }),
        ...(data.amount && { amount: data.amount }),
      },
      include: {
        category: true,
      },
    });
  }

  /**
   * Remove orçamento
   */
  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    await this.prisma.budget.delete({
      where: { id },
    });

    return { message: 'Orçamento removido com sucesso' };
  }

  /**
   * Calcula progresso de um orçamento específico
   */
  async calculateProgress(
    userId: string,
    budgetId: string,
  ): Promise<BudgetProgress> {
    const budget = await this.findOne(userId, budgetId);

    // Define período de consulta
    const { startDate, endDate } = this.getPeriodDates(
      budget.period,
      budget.year,
      budget.month,
    );

    // Busca transações do período
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        flow: 'expense',
        ...(budget.categoryId && { categoryId: budget.categoryId }),
      },
    });

    const spentAmount = transactions.reduce(
      (sum, tx) => sum + tx.amount,
      0,
    );
    const remainingAmount = budget.amount - spentAmount;
    const percentUsed = (spentAmount / budget.amount) * 100;

    let status: 'safe' | 'warning' | 'exceeded';
    if (percentUsed >= 100) {
      status = 'exceeded';
    } else if (percentUsed >= 80) {
      status = 'warning';
    } else {
      status = 'safe';
    }

    return {
      budgetId: budget.id,
      period: budget.period,
      year: budget.year,
      month: budget.month || undefined,
      categoryName: budget.category?.name,
      budgetedAmount: budget.amount,
      spentAmount,
      remainingAmount,
      percentUsed: Math.round(percentUsed * 10) / 10,
      status,
    };
  }

  /**
   * Calcula progresso de todos os orçamentos do usuário
   */
  async calculateAllProgress(userId: string): Promise<BudgetProgress[]> {
    const budgets = await this.findAll(userId);

    const progressList = await Promise.all(
      budgets.map((budget) => this.calculateProgress(userId, budget.id)),
    );

    return progressList;
  }

  /**
   * Retorna datas de início e fim do período
   */
  private getPeriodDates(
    period: BudgetPeriod,
    year: number,
    month?: number | null,
  ): { startDate: Date; endDate: Date } {
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'monthly':
        if (!month) throw new Error('Mês é obrigatório para período mensal');
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0, 23, 59, 59);
        break;

      case 'quarterly':
        const quarter = Math.ceil((month || 1) / 3);
        const quarterStartMonth = (quarter - 1) * 3;
        startDate = new Date(year, quarterStartMonth, 1);
        endDate = new Date(year, quarterStartMonth + 3, 0, 23, 59, 59);
        break;

      case 'annual':
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31, 23, 59, 59);
        break;

      default:
        throw new Error('Período inválido');
    }

    return { startDate, endDate };
  }
}
