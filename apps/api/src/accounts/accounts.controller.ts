import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import type { ApiResponse, CreateAccountInput } from '@pwr/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccountsService } from './accounts.service';
import { AccountDto, CreateAccountDto, UpdateAccountDto } from './dto/account.dto';

@ApiTags('accounts')
@Controller('accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Criar conta',
    description: 'Cria uma nova conta bancária. O nome da conta deve ser único para o usuário.',
  })
  @ApiBody({ type: CreateAccountDto })
  @SwaggerResponse({ 
    status: 201, 
    description: 'Conta criada com sucesso',
    type: AccountDto,
  })
  @SwaggerResponse({ 
    status: 400, 
    description: 'Dados inválidos',
  })
  @SwaggerResponse({ 
    status: 409, 
    description: 'Já existe uma conta com este nome',
  })
  async create(@Request() req: any, @Body() input: CreateAccountInput): Promise<ApiResponse> {
    const account = await this.accountsService.create(req.user.userId, input);
    return { success: true, data: account, message: 'Conta criada com sucesso' };
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar contas',
    description: 'Retorna todas as contas do usuário autenticado.',
  })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Lista de contas retornada com sucesso',
    type: [AccountDto],
  })
  async findAll(@Request() req: any): Promise<ApiResponse> {
    const accounts = await this.accountsService.findAll(req.user.userId);
    return { success: true, data: accounts };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obter conta por ID',
    description: 'Retorna os detalhes de uma conta específica.',
  })
  @ApiParam({ name: 'id', description: 'ID da conta', example: 'cm2x1y2z3...' })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Conta encontrada',
    type: AccountDto,
  })
  @SwaggerResponse({ 
    status: 404, 
    description: 'Conta não encontrada',
  })
  async findOne(@Request() req: any, @Param('id') id: string): Promise<ApiResponse> {
    const account = await this.accountsService.findOne(req.user.userId, id);
    return { success: true, data: account };
  }

  @Get(':id/balance')
  @ApiOperation({ 
    summary: 'Obter saldo da conta',
    description: 'Calcula e retorna o saldo atual da conta baseado nas transações.',
  })
  @ApiParam({ name: 'id', description: 'ID da conta', example: 'cm2x1y2z3...' })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Saldo retornado com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            accountId: { type: 'string', example: 'cm2x1y2z3...' },
            balance: { type: 'number', example: 2500.75 },
          },
        },
      },
    },
  })
  @SwaggerResponse({ 
    status: 404, 
    description: 'Conta não encontrada',
  })
  async getBalance(@Request() req: any, @Param('id') id: string): Promise<ApiResponse> {
    const balance = await this.accountsService.getBalance(req.user.userId, id);
    return { success: true, data: balance };
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Atualizar conta',
    description: 'Atualiza os dados de uma conta existente.',
  })
  @ApiParam({ name: 'id', description: 'ID da conta', example: 'cm2x1y2z3...' })
  @ApiBody({ type: UpdateAccountDto })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Conta atualizada com sucesso',
    type: AccountDto,
  })
  @SwaggerResponse({ 
    status: 404, 
    description: 'Conta não encontrada',
  })
  @SwaggerResponse({ 
    status: 409, 
    description: 'Já existe uma conta com este nome',
  })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() input: Partial<CreateAccountInput>,
  ): Promise<ApiResponse> {
    const account = await this.accountsService.update(req.user.userId, id, input);
    return { success: true, data: account, message: 'Conta atualizada com sucesso' };
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Deletar conta',
    description: 'Remove uma conta do sistema. Não é possível deletar contas com transações ou cartões vinculados.',
  })
  @ApiParam({ name: 'id', description: 'ID da conta', example: 'cm2x1y2z3...' })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Conta deletada com sucesso',
  })
  @SwaggerResponse({ 
    status: 400, 
    description: 'Não é possível deletar conta com transações ou cartões vinculados',
  })
  @SwaggerResponse({ 
    status: 404, 
    description: 'Conta não encontrada',
  })
  async remove(@Request() req: any, @Param('id') id: string): Promise<ApiResponse> {
    await this.accountsService.remove(req.user.userId, id);
    return { success: true, message: 'Conta deletada com sucesso' };
  }
}
