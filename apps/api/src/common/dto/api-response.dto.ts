import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ example: 'Operação realizada com sucesso', required: false })
  message?: string;

  @ApiProperty({ example: 'Erro ao processar solicitação', required: false })
  error?: string;
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Erro ao processar solicitação' })
  error: string;

  @ApiProperty({ example: 'Bad Request' })
  message: string;

  @ApiProperty({ example: 400 })
  statusCode: number;
}
