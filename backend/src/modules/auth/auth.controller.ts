import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('telegram')
  async login(@Body('initData') initData: string) {
    return this.authService.validateTelegramLogin(initData);
  }
}
