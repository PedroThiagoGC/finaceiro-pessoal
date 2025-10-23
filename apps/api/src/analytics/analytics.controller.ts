import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiTags,
  ApiResponse as SwaggerResponse,
  ApiQuery,
} from '@nestjs/swagger';
import type { ApiResponse } from '@pwr/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ 
    summary: 'Visão geral financeira',
    description: 'Retorna um resumo financeiro com receitas, despesas e saldo do período especificado.',
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'Data inicial (YYYY-MM-DD)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data final (YYYY-MM-DD)', example: '2024-01-31' })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Visão geral retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            totalIncome: { type: 'number', example: 5000.00, description: 'Total de receitas' },
            totalExpense: { type: 'number', example: 3500.50, description: 'Total de despesas' },
            balance: { type: 'number', example: 1499.50, description: 'Saldo (receitas - despesas)' },
            transactionCount: { type: 'number', example: 42, description: 'Número de transações' },
          },
        },
      },
    },
  })
  async getOverview(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ApiResponse> {
    const data = await this.analyticsService.getOverview(req.user.userId, startDate, endDate);
    return { success: true, data };
  }

  @Get('by-category')
  @ApiOperation({ 
    summary: 'Gastos por categoria',
    description: 'Retorna o total de gastos agrupado por categoria no período especificado.',
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'Data inicial (YYYY-MM-DD)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data final (YYYY-MM-DD)', example: '2024-01-31' })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Gastos por categoria retornados com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              categoryId: { type: 'string', example: 'cm2x1y2z3...' },
              categoryName: { type: 'string', example: 'Alimentação' },
              color: { type: 'string', example: '#FF5722' },
              total: { type: 'number', example: 850.50 },
              count: { type: 'number', example: 15 },
              percentage: { type: 'number', example: 24.3 },
            },
          },
        },
      },
    },
  })
  async getByCategory(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ApiResponse> {
    const data = await this.analyticsService.getByCategory(req.user.userId, startDate, endDate);
    return { success: true, data };
  }

  @Get('by-card')
  @ApiOperation({ 
    summary: 'Gastos por cartão',
    description: 'Retorna o total de gastos agrupado por cartão de crédito no mês especificado.',
  })
  @ApiQuery({ name: 'month', required: false, description: 'Mês (YYYY-MM)', example: '2024-01' })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Gastos por cartão retornados com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              cardId: { type: 'string', example: 'cm2x1y2z3...' },
              cardNickname: { type: 'string', example: 'Nubank Roxinho' },
              lastFourDigits: { type: 'string', example: '1234' },
              total: { type: 'number', example: 1250.50 },
              count: { type: 'number', example: 8 },
              creditLimit: { type: 'number', example: 5000.00 },
              usagePercentage: { type: 'number', example: 25.01 },
            },
          },
        },
      },
    },
  })
  async getByCard(@Request() req: any, @Query('month') month?: string): Promise<ApiResponse> {
    const data = await this.analyticsService.getByCard(req.user.userId, month);
    return { success: true, data };
  }

  @Get('cashflow')
  @ApiOperation({ 
    summary: 'Cashflow diário do mês',
    description: 'Retorna o fluxo de caixa diário (receitas, despesas e saldo acumulado) para um mês específico.',
  })
  @ApiQuery({ name: 'year', required: true, description: 'Ano', example: '2024' })
  @ApiQuery({ name: 'month', required: true, description: 'Mês (1-12)', example: '1' })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Cashflow retornado com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              day: { type: 'number', example: 15 },
              date: { type: 'string', example: '2024-01-15' },
              income: { type: 'number', example: 0 },
              expense: { type: 'number', example: 150.75 },
              balance: { type: 'number', example: -150.75 },
              accumulatedBalance: { type: 'number', example: 2349.25 },
            },
          },
        },
      },
    },
  })
  async getCashflow(
    @Request() req: any,
    @Query('year') year: string,
    @Query('month') month: string,
  ): Promise<ApiResponse> {
    const data = await this.analyticsService.getCashflow(
      req.user.userId,
      parseInt(year),
      parseInt(month),
    );
    return { success: true, data };
  }
}
