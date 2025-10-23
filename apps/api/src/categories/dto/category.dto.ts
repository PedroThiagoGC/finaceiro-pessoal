import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nome da categoria',
    example: 'Alimentação',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'Tipo da categoria',
    enum: ['INCOME', 'EXPENSE'],
    example: 'EXPENSE',
  })
  @IsEnum(['INCOME', 'EXPENSE'])
  type: string;

  @ApiProperty({
    description: 'Cor da categoria em hexadecimal',
    example: '#FF5722',
  })
  @IsString()
  color: string;

  @ApiProperty({
    description: 'Ícone da categoria (emoji ou nome do ícone)',
    example: '🍔',
    required: false,
  })
  @IsString()
  @IsOptional()
  icon?: string;
}

export class UpdateCategoryDto {
  @ApiProperty({ required: false })
  @IsString()
  @MinLength(3)
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false, enum: ['INCOME', 'EXPENSE'] })
  @IsEnum(['INCOME', 'EXPENSE'])
  @IsOptional()
  type?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  icon?: string;
}

export class CategoryDto {
  @ApiProperty({ example: 'cm2x1y2z3...' })
  id: string;

  @ApiProperty({ example: 'Alimentação' })
  name: string;

  @ApiProperty({ example: 'EXPENSE' })
  type: string;

  @ApiProperty({ example: '#FF5722' })
  color: string;

  @ApiProperty({ example: '🍔' })
  icon: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;
}
