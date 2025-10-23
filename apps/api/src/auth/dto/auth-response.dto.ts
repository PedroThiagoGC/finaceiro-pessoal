import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: 'cm2x1y2z3...' })
  id: string;

  @ApiProperty({ example: 'João da Silva' })
  name: string;

  @ApiProperty({ example: 'joao@exemplo.com' })
  email: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ type: UserDto })
  user: UserDto;
}
