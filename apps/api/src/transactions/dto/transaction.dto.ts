import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Descrição da transação',
    example: 'Compra no supermercado',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  description: string;

  @ApiProperty({
    description: 'Valor da transação',
    example: 150.75,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Data da transação',
    example: '2024-01-15T10:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty({
    description: 'Tipo da transação',
    enum: ['INCOME', 'EXPENSE', 'TRANSFER'],
    example: 'EXPENSE',
  })
  @IsEnum(['INCOME', 'EXPENSE', 'TRANSFER'])
  type: string;

  @ApiProperty({
    description: 'ID da categoria',
    example: 'cm2x1y2z3...',
  })
  @IsString()
  categoryId: string;

  @ApiProperty({
    description: 'ID da conta (obrigatório para INCOME e EXPENSE)',
    example: 'cm2x1y2z3...',
    required: false,
  })
  @IsString()
  @IsOptional()
  accountId?: string;

  @ApiProperty({
    description: 'ID do cartão (opcional para compras no crédito)',
    example: 'cm2x1y2z3...',
    required: false,
  })
  @IsString()
  @IsOptional()
  cardId?: string;

  @ApiProperty({
    description: 'ID da conta de origem (para transferências)',
    example: 'cm2x1y2z3...',
    required: false,
  })
  @IsString()
  @IsOptional()
  fromAccountId?: string;

  @ApiProperty({
    description: 'ID da conta de destino (para transferências)',
    example: 'cm2x1y2z3...',
    required: false,
  })
  @IsString()
  @IsOptional()
  toAccountId?: string;

  @ApiProperty({
    description: 'Transação conciliada',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  reconciled?: boolean;

  @ApiProperty({
    description: 'Observações adicionais',
    example: 'Compra parcelada em 3x',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateTransactionDto {
  @ApiProperty({ required: false })
  @IsString()
  @MinLength(3)
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @ApiProperty({ required: false })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  date?: Date;

  @ApiProperty({ required: false, enum: ['INCOME', 'EXPENSE', 'TRANSFER'] })
  @IsEnum(['INCOME', 'EXPENSE', 'TRANSFER'])
  @IsOptional()
  type?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  accountId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  cardId?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  reconciled?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class TransactionDto {
  @ApiProperty({ example: 'cm2x1y2z3...' })
  id: string;

  @ApiProperty({ example: 'Compra no supermercado' })
  description: string;

  @ApiProperty({ example: 150.75 })
  amount: number;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  date: Date;

  @ApiProperty({ example: 'EXPENSE' })
  type: string;

  @ApiProperty({ example: false })
  reconciled: boolean;

  @ApiProperty({ example: 'Compra parcelada em 3x', nullable: true })
  notes: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;
}
