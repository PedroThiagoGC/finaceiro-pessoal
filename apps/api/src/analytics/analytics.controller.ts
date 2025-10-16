import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ApiResponse } from '@pwr/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Visão geral financeira' })
  async getOverview(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ApiResponse> {
    const data = await this.analyticsService.getOverview(req.user.userId, startDate, endDate);
    return { success: true, data };
  }

  @Get('by-category')
  @ApiOperation({ summary: 'Gastos por categoria' })
  async getByCategory(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ApiResponse> {
    const data = await this.analyticsService.getByCategory(req.user.userId, startDate, endDate);
    return { success: true, data };
  }

  @Get('by-card')
  @ApiOperation({ summary: 'Gastos por cartão' })
  async getByCard(@Request() req: any, @Query('month') month?: string): Promise<ApiResponse> {
    const data = await this.analyticsService.getByCard(req.user.userId, month);
    return { success: true, data };
  }

  @Get('cashflow')
  @ApiOperation({ summary: 'Cashflow diário do mês' })
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
