import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ApiResponse, LoginInput, RegisterInput } from '@pwr/types';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  async register(@Body() input: RegisterInput): Promise<ApiResponse> {
    const result = await this.authService.register(input);
    return {
      success: true,
      data: result,
      message: 'Usuário registrado com sucesso',
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login de usuário' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter dados do usuário atual' })
  async getMe(@Request() req: any): Promise<ApiResponse> {
    const user = await this.authService.getMe(req.user.userId);
    return {
      success: true,
      data: user,
    };
  }
}
