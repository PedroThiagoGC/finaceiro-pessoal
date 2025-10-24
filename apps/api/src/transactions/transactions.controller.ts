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
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import type { ApiResponse, CreateTransactionInput } from '@pwr/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTransactionDto, TransactionDto, UpdateTransactionDto } from './dto/transaction.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Criar transação',
    description: `Cria uma nova transação financeira.
    
**Tipos de transação:**
- **INCOME**: Receita - requer accountId e categoryId
- **EXPENSE**: Despesa - requer (accountId ou cardId) e categoryId  
- **TRANSFER**: Transferência - requer fromAccountId e toAccountId`,
  })
  @ApiBody({ type: CreateTransactionDto })
  @SwaggerResponse({ 
    status: 201, 
    description: 'Transação criada com sucesso',
    type: TransactionDto,
  })
  @SwaggerResponse({ 
    status: 400, 
    description: 'Dados inválidos ou relacionamentos incorretos',
  })
  @SwaggerResponse({ 
    status: 404, 
    description: 'Categoria, conta ou cartão não encontrado',
  })
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
  @ApiOperation({ 
    summary: 'Listar transações',
    description: 'Retorna todas as transações do usuário com filtros opcionais.',
  })
  @ApiQuery({ name: 'type', required: false, enum: ['INCOME', 'EXPENSE', 'TRANSFER'], description: 'Filtrar por tipo' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filtrar por categoria' })
  @ApiQuery({ name: 'accountId', required: false, description: 'Filtrar por conta' })
  @ApiQuery({ name: 'cardId', required: false, description: 'Filtrar por cartão' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Data inicial (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data final (ISO 8601)' })
  @ApiQuery({ name: 'reconciled', required: false, type: Boolean, description: 'Filtrar por conciliação' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limita a quantidade de transações retornadas (1..100)' })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Lista de transações retornada com sucesso',
    type: [TransactionDto],
  })
  async findAll(@Request() req: any, @Query() filters: any): Promise<ApiResponse> {
    if (filters?.limit !== undefined) {
      const n = Number(filters.limit);
      if (!Number.isFinite(n)) delete filters.limit;
      else filters.limit = Math.min(Math.max(Math.trunc(n), 1), 100);
    }
    const transactions = await this.transactionsService.findAll(req.user.userId, filters);
    return {
      success: true,
      data: transactions,
    };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obter transação por ID',
    description: 'Retorna os detalhes de uma transação específica.',
  })
  @ApiParam({ name: 'id', description: 'ID da transação', example: 'cm2x1y2z3...' })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Transação encontrada',
    type: TransactionDto,
  })
  @SwaggerResponse({ 
    status: 404, 
    description: 'Transação não encontrada',
  })
  async findOne(@Request() req: any, @Param('id') id: string): Promise<ApiResponse> {
    const transaction = await this.transactionsService.findOne(req.user.userId, id);
    return {
      success: true,
      data: transaction,
    };
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Atualizar transação',
    description: 'Atualiza os dados de uma transação existente.',
  })
  @ApiParam({ name: 'id', description: 'ID da transação', example: 'cm2x1y2z3...' })
  @ApiBody({ type: UpdateTransactionDto })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Transação atualizada com sucesso',
    type: TransactionDto,
  })
  @SwaggerResponse({ 
    status: 404, 
    description: 'Transação não encontrada',
  })
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
  @ApiOperation({ 
    summary: 'Deletar transação',
    description: 'Remove uma transação do sistema.',
  })
  @ApiParam({ name: 'id', description: 'ID da transação', example: 'cm2x1y2z3...' })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Transação deletada com sucesso',
  })
  @SwaggerResponse({ 
    status: 404, 
    description: 'Transação não encontrada',
  })
  async remove(@Request() req: any, @Param('id') id: string): Promise<ApiResponse> {
    await this.transactionsService.remove(req.user.userId, id);
    return {
      success: true,
      message: 'Transação deletada com sucesso',
    };
  }

  @Post(':id/reconcile')
  @ApiOperation({ 
    summary: 'Conciliar transação',
    description: 'Marca uma transação como conciliada (confirmada com extrato bancário).',
  })
  @ApiParam({ name: 'id', description: 'ID da transação', example: 'cm2x1y2z3...' })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Transação conciliada com sucesso',
    type: TransactionDto,
  })
  @SwaggerResponse({ 
    status: 404, 
    description: 'Transação não encontrada',
  })
  async reconcile(@Request() req: any, @Param('id') id: string): Promise<ApiResponse> {
    const transaction = await this.transactionsService.reconcile(req.user.userId, id);
    return {
      success: true,
      data: transaction,
      message: 'Transação conciliada com sucesso',
    };
  }
}
