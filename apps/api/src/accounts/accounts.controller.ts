import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ApiResponse, CreateAccountInput } from '@pwr/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccountsService } from './accounts.service';

@ApiTags('accounts')
@Controller('accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar conta' })
  async create(@Request() req: any, @Body() input: CreateAccountInput): Promise<ApiResponse> {
    const account = await this.accountsService.create(req.user.userId, input);
    return { success: true, data: account, message: 'Conta criada com sucesso' };
  }

  @Get()
  @ApiOperation({ summary: 'Listar contas' })
  async findAll(@Request() req: any): Promise<ApiResponse> {
    const accounts = await this.accountsService.findAll(req.user.userId);
    return { success: true, data: accounts };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter conta por ID' })
  async findOne(@Request() req: any, @Param('id') id: string): Promise<ApiResponse> {
    const account = await this.accountsService.findOne(req.user.userId, id);
    return { success: true, data: account };
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Obter saldo da conta' })
  async getBalance(@Request() req: any, @Param('id') id: string): Promise<ApiResponse> {
    const balance = await this.accountsService.getBalance(req.user.userId, id);
    return { success: true, data: balance };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar conta' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() input: Partial<CreateAccountInput>,
  ): Promise<ApiResponse> {
    const account = await this.accountsService.update(req.user.userId, id, input);
    return { success: true, data: account, message: 'Conta atualizada com sucesso' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar conta' })
  async remove(@Request() req: any, @Param('id') id: string): Promise<ApiResponse> {
    await this.accountsService.remove(req.user.userId, id);
    return { success: true, message: 'Conta deletada com sucesso' };
  }
}
