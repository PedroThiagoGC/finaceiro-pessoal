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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ApiResponse, CreateTransactionInput } from '@pwr/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar transação' })
  async create(
    @Request() req: any,
    @Body() input: CreateTransactionInput,
  ): Promise<ApiResponse> {
    const transaction = await this.transactionsService.create(req.user.userId, input);
    return {
      success: true,
      data: transaction,
      message: 'Transação criada com sucesso',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar transações' })
  async findAll(@Request() req: any, @Query() filters: any): Promise<ApiResponse> {
    const transactions = await this.transactionsService.findAll(req.user.userId, filters);
    return {
      success: true,
      data: transactions,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter transação por ID' })
  async findOne(@Request() req: any, @Param('id') id: string): Promise<ApiResponse> {
    const transaction = await this.transactionsService.findOne(req.user.userId, id);
    return {
      success: true,
      data: transaction,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar transação' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() input: Partial<CreateTransactionInput>,
  ): Promise<ApiResponse> {
    const transaction = await this.transactionsService.update(req.user.userId, id, input);
    return {
      success: true,
      data: transaction,
      message: 'Transação atualizada com sucesso',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar transação' })
  async remove(@Request() req: any, @Param('id') id: string): Promise<ApiResponse> {
    await this.transactionsService.remove(req.user.userId, id);
    return {
      success: true,
      message: 'Transação deletada com sucesso',
    };
  }

  @Post(':id/reconcile')
  @ApiOperation({ summary: 'Conciliar transação' })
  async reconcile(@Request() req: any, @Param('id') id: string): Promise<ApiResponse> {
    const transaction = await this.transactionsService.reconcile(req.user.userId, id);
    return {
      success: true,
      data: transaction,
      message: 'Transação conciliada com sucesso',
    };
  }
}
