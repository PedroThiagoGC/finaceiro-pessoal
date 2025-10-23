import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João da Silva',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'E-mail do usuário (será usado para login)',
    example: 'joao@exemplo.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'SenhaSegura123!',
    minLength: 6,
    format: 'password',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
