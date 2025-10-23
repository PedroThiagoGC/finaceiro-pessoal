import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({
    description: 'Nome da conta',
    example: 'Conta Corrente Banco do Brasil',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'Tipo da conta',
    enum: ['CHECKING', 'SAVINGS', 'INVESTMENT', 'CASH', 'OTHER'],
    example: 'CHECKING',
  })
  @IsEnum(['CHECKING', 'SAVINGS', 'INVESTMENT', 'CASH', 'OTHER'])
  type: string;

  @ApiProperty({
    description: 'Saldo inicial da conta',
    example: 1000.50,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  openingBalance: number;

  @ApiProperty({
    description: 'Cor da conta em hexadecimal',
    example: '#4CAF50',
    required: false,
  })
  @IsString()
  @IsOptional()
  color?: string;
}

export class UpdateAccountDto {
  @ApiProperty({ required: false })
  @IsString()
  @MinLength(3)
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false, enum: ['CHECKING', 'SAVINGS', 'INVESTMENT', 'CASH', 'OTHER'] })
  @IsEnum(['CHECKING', 'SAVINGS', 'INVESTMENT', 'CASH', 'OTHER'])
  @IsOptional()
  type?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  color?: string;
}

export class AccountDto {
  @ApiProperty({ example: 'cm2x1y2z3...' })
  id: string;

  @ApiProperty({ example: 'Conta Corrente Banco do Brasil' })
  name: string;

  @ApiProperty({ example: 'CHECKING' })
  type: string;

  @ApiProperty({ example: 1000.50 })
  openingBalance: number;

  @ApiProperty({ example: 2500.75 })
  currentBalance: number;

  @ApiProperty({ example: '#4CAF50' })
  color: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;
}
