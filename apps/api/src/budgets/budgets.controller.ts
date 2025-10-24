import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
    BudgetsService,
    CreateBudgetDto,
    UpdateBudgetDto,
} from './budgets.service';

@ApiTags('budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria novo orçamento' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          enum: ['monthly', 'quarterly', 'annual'],
          description: 'Período do orçamento',
        },
        year: { type: 'number', description: 'Ano' },
        month: {
          type: 'number',
          description: 'Mês (1-12, obrigatório se period=monthly)',
          nullable: true,
        },
        categoryId: {
          type: 'string',
          description: 'ID da categoria (opcional, para orçamento geral omitir)',
          nullable: true,
        },
        amount: { type: 'number', description: 'Valor orçado' },
      },
      required: ['period', 'year', 'amount'],
    },
  })
  @ApiResponse({ status: 201, description: 'Orçamento criado com sucesso' })
  async create(@Request() req, @Body() data: CreateBudgetDto) {
    return this.budgetsService.create(req.user.userId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Lista orçamentos do usuário' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['monthly', 'quarterly', 'annual'],
  })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de orçamentos' })
  async findAll(
    @Request() req,
    @Query('period') period?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.budgetsService.findAll(req.user.userId, {
      period: period as any,
      year: year ? parseInt(year) : undefined,
      month: month ? parseInt(month) : undefined,
      categoryId,
    });
  }

  @Get('progress')
  @ApiOperation({ summary: 'Calcula progresso de todos os orçamentos' })
  @ApiResponse({
    status: 200,
    description: 'Progresso de todos os orçamentos',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          budgetId: { type: 'string' },
          period: { type: 'string' },
          year: { type: 'number' },
          month: { type: 'number' },
          categoryName: { type: 'string' },
          budgetedAmount: { type: 'number' },
          spentAmount: { type: 'number' },
          remainingAmount: { type: 'number' },
          percentUsed: { type: 'number' },
          status: { type: 'string', enum: ['safe', 'warning', 'exceeded'] },
        },
      },
    },
  })
  async getAllProgress(@Request() req) {
    return this.budgetsService.calculateAllProgress(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca orçamento por ID' })
  @ApiResponse({ status: 200, description: 'Orçamento encontrado' })
  @ApiResponse({ status: 404, description: 'Orçamento não encontrado' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.budgetsService.findOne(req.user.userId, id);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Calcula progresso de um orçamento' })
  @ApiResponse({
    status: 200,
    description: 'Progresso do orçamento',
    schema: {
      type: 'object',
      properties: {
        budgetId: { type: 'string' },
        period: { type: 'string' },
        year: { type: 'number' },
        month: { type: 'number' },
        categoryName: { type: 'string' },
        budgetedAmount: { type: 'number' },
        spentAmount: { type: 'number' },
        remainingAmount: { type: 'number' },
        percentUsed: { type: 'number' },
        status: { type: 'string', enum: ['safe', 'warning', 'exceeded'] },
      },
    },
  })
  async getProgress(@Request() req, @Param('id') id: string) {
    return this.budgetsService.calculateProgress(req.user.userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza orçamento' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['monthly', 'quarterly', 'annual'] },
        year: { type: 'number' },
        month: { type: 'number', nullable: true },
        categoryId: { type: 'string', nullable: true },
        amount: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Orçamento atualizado com sucesso' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() data: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(req.user.userId, id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove orçamento' })
  @ApiResponse({ status: 200, description: 'Orçamento removido com sucesso' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.budgetsService.remove(req.user.userId, id);
  }
}
