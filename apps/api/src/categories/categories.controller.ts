import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ApiResponse, CreateCategoryInput } from '@pwr/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar categoria' })
  async create(@Request() req: any, @Body() input: CreateCategoryInput): Promise<ApiResponse> {
    const category = await this.categoriesService.create(req.user.userId, input);
    return { success: true, data: category, message: 'Categoria criada com sucesso' };
  }

  @Get()
  @ApiOperation({ summary: 'Listar categorias' })
  async findAll(@Request() req: any): Promise<ApiResponse> {
    const categories = await this.categoriesService.findAll(req.user.userId);
    return { success: true, data: categories };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter categoria por ID' })
  async findOne(@Request() req: any, @Param('id') id: string): Promise<ApiResponse> {
    const category = await this.categoriesService.findOne(req.user.userId, id);
    return { success: true, data: category };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar categoria' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() input: Partial<CreateCategoryInput>,
  ): Promise<ApiResponse> {
    const category = await this.categoriesService.update(req.user.userId, id, input);
    return { success: true, data: category, message: 'Categoria atualizada com sucesso' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar categoria' })
  async remove(@Request() req: any, @Param('id') id: string): Promise<ApiResponse> {
    await this.categoriesService.remove(req.user.userId, id);
    return { success: true, message: 'Categoria deletada com sucesso' };
  }
}
