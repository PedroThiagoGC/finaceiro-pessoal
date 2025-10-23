import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiTags,
  ApiResponse as SwaggerResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import type { ApiResponse, CreateCategoryInput } from '@pwr/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryDto } from './dto/category.dto';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Criar categoria',
    description: 'Cria uma nova categoria de receita ou despesa. O nome deve ser único para o usuário.',
  })
  @ApiBody({ type: CreateCategoryDto })
  @SwaggerResponse({ 
    status: 201, 
    description: 'Categoria criada com sucesso',
    type: CategoryDto,
  })
  @SwaggerResponse({ 
    status: 400, 
    description: 'Dados inválidos (cor deve ser hexadecimal)',
  })
  @SwaggerResponse({ 
    status: 409, 
    description: 'Já existe uma categoria com este nome',
  })
  async create(@Request() req: any, @Body() input: CreateCategoryInput): Promise<ApiResponse> {
    const category = await this.categoriesService.create(req.user.userId, input);
    return { success: true, data: category, message: 'Categoria criada com sucesso' };
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar categorias',
    description: 'Retorna todas as categorias do usuário.',
  })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Lista de categorias retornada com sucesso',
    type: [CategoryDto],
  })
  async findAll(@Request() req: any): Promise<ApiResponse> {
    const categories = await this.categoriesService.findAll(req.user.userId);
    return { success: true, data: categories };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obter categoria por ID',
    description: 'Retorna os detalhes de uma categoria específica.',
  })
  @ApiParam({ name: 'id', description: 'ID da categoria', example: 'cm2x1y2z3...' })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Categoria encontrada',
    type: CategoryDto,
  })
  @SwaggerResponse({ 
    status: 404, 
    description: 'Categoria não encontrada',
  })
  async findOne(@Request() req: any, @Param('id') id: string): Promise<ApiResponse> {
    const category = await this.categoriesService.findOne(req.user.userId, id);
    return { success: true, data: category };
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Atualizar categoria',
    description: 'Atualiza os dados de uma categoria existente.',
  })
  @ApiParam({ name: 'id', description: 'ID da categoria', example: 'cm2x1y2z3...' })
  @ApiBody({ type: UpdateCategoryDto })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Categoria atualizada com sucesso',
    type: CategoryDto,
  })
  @SwaggerResponse({ 
    status: 400, 
    description: 'Cor inválida (deve ser hexadecimal)',
  })
  @SwaggerResponse({ 
    status: 404, 
    description: 'Categoria não encontrada',
  })
  @SwaggerResponse({ 
    status: 409, 
    description: 'Já existe uma categoria com este nome',
  })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() input: Partial<CreateCategoryInput>,
  ): Promise<ApiResponse> {
    const category = await this.categoriesService.update(req.user.userId, id, input);
    return { success: true, data: category, message: 'Categoria atualizada com sucesso' };
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Deletar categoria',
    description: 'Remove uma categoria do sistema. Não é possível deletar categorias com transações ou orçamentos vinculados.',
  })
  @ApiParam({ name: 'id', description: 'ID da categoria', example: 'cm2x1y2z3...' })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Categoria deletada com sucesso',
  })
  @SwaggerResponse({ 
    status: 400, 
    description: 'Não é possível deletar categoria com transações ou orçamentos vinculados',
  })
  @SwaggerResponse({ 
    status: 404, 
    description: 'Categoria não encontrada',
  })
  async remove(@Request() req: any, @Param('id') id: string): Promise<ApiResponse> {
    await this.categoriesService.remove(req.user.userId, id);
    return { success: true, message: 'Categoria deletada com sucesso' };
  }
}
