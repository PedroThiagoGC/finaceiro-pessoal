import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ApiResponse, CreateCardInput } from '@pwr/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CardsService } from './cards.service';

@ApiTags('cards')
@Controller('cards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CardsController {
  constructor(private cardsService: CardsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar cartão' })
  async create(@Request() req: any, @Body() input: CreateCardInput): Promise<ApiResponse> {
    const card = await this.cardsService.create(req.user.userId, input);
    return { success: true, data: card, message: 'Cartão criado com sucesso' };
  }

  @Get()
  @ApiOperation({ summary: 'Listar cartões' })
  async findAll(@Request() req: any): Promise<ApiResponse> {
    const cards = await this.cardsService.findAll(req.user.userId);
    return { success: true, data: cards };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter cartão por ID' })
  async findOne(@Request() req: any, @Param('id') id: string): Promise<ApiResponse> {
    const card = await this.cardsService.findOne(req.user.userId, id);
    return { success: true, data: card };
  }

  @Get(':id/invoice')
  @ApiOperation({ summary: 'Obter fatura do cartão' })
  async getInvoice(
    @Request() req: any,
    @Param('id') id: string,
    @Query('month') month: string,
  ): Promise<ApiResponse> {
    const invoice = await this.cardsService.getInvoice(req.user.userId, id, month);
    return { success: true, data: invoice };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cartão' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() input: Partial<CreateCardInput>,
  ): Promise<ApiResponse> {
    const card = await this.cardsService.update(req.user.userId, id, input);
    return { success: true, data: card, message: 'Cartão atualizado com sucesso' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar cartão' })
  async remove(@Request() req: any, @Param('id') id: string): Promise<ApiResponse> {
    await this.cardsService.remove(req.user.userId, id);
    return { success: true, message: 'Cartão deletado com sucesso' };
  }
}
