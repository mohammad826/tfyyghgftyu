import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  getProfile(@Request() req) {
    return this.userService.getProfile(req.user.userId);
  }

  @Get('stats')
  getStats(@Request() req) {
    return this.userService.getStats(req.user.userId);
  }
}
