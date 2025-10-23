import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateCardDto {
  @ApiProperty({
    description: 'Apelido do cartão',
    example: 'Nubank Roxinho',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  nickname: string;

  @ApiProperty({
    description: 'Últimos 4 dígitos do cartão',
    example: '1234',
    minLength: 4,
    maxLength: 4,
  })
  @IsString()
  lastFourDigits: string;

  @ApiProperty({
    description: 'Limite de crédito do cartão',
    example: 5000.00,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  creditLimit: number;

  @ApiProperty({
    description: 'Dia de fechamento da fatura (1-31)',
    example: 15,
    minimum: 1,
    maximum: 31,
  })
  @IsInt()
  @Min(1)
  @Max(31)
  billingDay: number;

  @ApiProperty({
    description: 'Dia de vencimento da fatura (1-31)',
    example: 22,
    minimum: 1,
    maximum: 31,
  })
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay: number;

  @ApiProperty({
    description: 'ID da conta vinculada ao cartão',
    example: 'cm2x1y2z3...',
  })
  @IsString()
  accountId: string;

  @ApiProperty({
    description: 'Cor do cartão em hexadecimal',
    example: '#9C27B0',
    required: false,
  })
  @IsString()
  @IsOptional()
  color?: string;
}

export class UpdateCardDto {
  @ApiProperty({ required: false })
  @IsString()
  @MinLength(3)
  @IsOptional()
  nickname?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  creditLimit?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  billingDay?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  dueDay?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  color?: string;
}

export class CardDto {
  @ApiProperty({ example: 'cm2x1y2z3...' })
  id: string;

  @ApiProperty({ example: 'Nubank Roxinho' })
  nickname: string;

  @ApiProperty({ example: '1234' })
  lastFourDigits: string;

  @ApiProperty({ example: 5000.00 })
  creditLimit: number;

  @ApiProperty({ example: 3200.50 })
  currentBalance: number;

  @ApiProperty({ example: 15 })
  billingDay: number;

  @ApiProperty({ example: 22 })
  dueDay: number;

  @ApiProperty({ example: '#9C27B0' })
  color: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;
}
