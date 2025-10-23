import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import type { ApiResponse, CreateCardInput } from '@pwr/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CardsService } from './cards.service';
import { CardDto, CreateCardDto, UpdateCardDto } from './dto/card.dto';

@ApiTags('cards')
@Controller('cards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CardsController {
  constructor(private cardsService: CardsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Criar cartão',
    description: 'Cria um novo cartão de crédito. O apelido deve ser único para o usuário.',
  })
  @ApiBody({ type: CreateCardDto })
  @SwaggerResponse({ 
    status: 201, 
    description: 'Cartão criado com sucesso',
    type: CardDto,
  })
  @SwaggerResponse({ 
    status: 400, 
    description: 'Dados inválidos',
  })
  @SwaggerResponse({ 
    status: 404, 
    description: 'Conta vinculada não encontrada',
  })
  @SwaggerResponse({ 
    status: 409, 
    description: 'Já existe um cartão com este apelido',
  })
  async create(@Request() req: any, @Body() input: CreateCardInput): Promise<ApiResponse> {
    const card = await this.cardsService.create(req.user.userId, input);
    return { success: true, data: card, message: 'Cartão criado com sucesso' };
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar cartões',
    description: 'Retorna todos os cartões de crédito do usuário.',
  })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Lista de cartões retornada com sucesso',
    type: [CardDto],
  })
  async findAll(@Request() req: any): Promise<ApiResponse> {
    const cards = await this.cardsService.findAll(req.user.userId);
    return { success: true, data: cards };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obter cartão por ID',
    description: 'Retorna os detalhes de um cartão específico.',
  })
  @ApiParam({ name: 'id', description: 'ID do cartão', example: 'cm2x1y2z3...' })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Cartão encontrado',
    type: CardDto,
  })
  @SwaggerResponse({ 
    status: 404, 
    description: 'Cartão não encontrado',
  })
  async findOne(@Request() req: any, @Param('id') id: string): Promise<ApiResponse> {
    const card = await this.cardsService.findOne(req.user.userId, id);
    return { success: true, data: card };
  }

  @Get(':id/invoice')
  @ApiOperation({ 
    summary: 'Obter fatura do cartão',
    description: 'Retorna a fatura do cartão para um mês específico (formato: YYYY-MM).',
  })
  @ApiParam({ name: 'id', description: 'ID do cartão', example: 'cm2x1y2z3...' })
  @ApiQuery({ name: 'month', description: 'Mês da fatura (YYYY-MM)', example: '2024-01' })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Fatura retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            cardId: { type: 'string', example: 'cm2x1y2z3...' },
            month: { type: 'string', example: '2024-01' },
            totalAmount: { type: 'number', example: 1250.50 },
            transactions: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
  })
  @SwaggerResponse({ 
    status: 404, 
    description: 'Cartão não encontrado',
  })
  async getInvoice(
    @Request() req: any,
    @Param('id') id: string,
    @Query('month') month: string,
  ): Promise<ApiResponse> {
    const invoice = await this.cardsService.getInvoice(req.user.userId, id, month);
    return { success: true, data: invoice };
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Atualizar cartão',
    description: 'Atualiza os dados de um cartão existente.',
  })
  @ApiParam({ name: 'id', description: 'ID do cartão', example: 'cm2x1y2z3...' })
  @ApiBody({ type: UpdateCardDto })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Cartão atualizado com sucesso',
    type: CardDto,
  })
  @SwaggerResponse({ 
    status: 404, 
    description: 'Cartão não encontrado',
  })
  @SwaggerResponse({ 
    status: 409, 
    description: 'Já existe um cartão com este apelido',
  })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() input: Partial<CreateCardInput>,
  ): Promise<ApiResponse> {
    const card = await this.cardsService.update(req.user.userId, id, input);
    return { success: true, data: card, message: 'Cartão atualizado com sucesso' };
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Deletar cartão',
    description: 'Remove um cartão do sistema. Não é possível deletar cartões com transações vinculadas.',
  })
  @ApiParam({ name: 'id', description: 'ID do cartão', example: 'cm2x1y2z3...' })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Cartão deletado com sucesso',
  })
  @SwaggerResponse({ 
    status: 400, 
    description: 'Não é possível deletar cartão com transações vinculadas',
  })
  @SwaggerResponse({ 
    status: 404, 
    description: 'Cartão não encontrado',
  })
  async remove(@Request() req: any, @Param('id') id: string): Promise<ApiResponse> {
    await this.cardsService.remove(req.user.userId, id);
    return { success: true, message: 'Cartão deletado com sucesso' };
  }
}
