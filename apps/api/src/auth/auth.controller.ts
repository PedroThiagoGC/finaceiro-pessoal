import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import type { ApiResponse, LoginInput, RegisterInput } from '@pwr/types';
import { AuthService } from './auth.service';
import { AuthResponseDto, UserDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ 
    summary: 'Registrar novo usuário',
    description: 'Cria uma nova conta de usuário no sistema. O e-mail deve ser único.',
  })
  @ApiBody({ type: RegisterDto })
  @SwaggerResponse({ 
    status: 201, 
    description: 'Usuário registrado com sucesso',
    type: AuthResponseDto,
  })
  @SwaggerResponse({ 
    status: 400, 
    description: 'Dados inválidos ou e-mail já cadastrado',
  })
  async register(@Body() input: RegisterInput): Promise<ApiResponse> {
    const result = await this.authService.register(input);
    return {
      success: true,
      data: result,
      message: 'Usuário registrado com sucesso',
    };
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'Login de usuário',
    description: 'Autentica um usuário e retorna um token JWT válido por 7 dias.',
  })
  @ApiBody({ type: LoginDto })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Login realizado com sucesso',
    type: AuthResponseDto,
  })
  @SwaggerResponse({ 
    status: 401, 
    description: 'Credenciais inválidas',
  })
  async login(@Body() input: LoginInput): Promise<ApiResponse> {
    const result = await this.authService.login(input);
    return {
      success: true,
      data: result,
      message: 'Login realizado com sucesso',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obter dados do usuário atual',
    description: 'Retorna as informações do usuário autenticado baseado no token JWT.',
  })
  @SwaggerResponse({ 
    status: 200, 
    description: 'Dados do usuário retornados com sucesso',
    type: UserDto,
  })
  @SwaggerResponse({ 
    status: 401, 
    description: 'Token inválido ou expirado',
  })
  async getMe(@Request() req: any): Promise<ApiResponse> {
    const user = await this.authService.getMe(req.user.userId);
    return {
      success: true,
      data: user,
    };
  }
}
