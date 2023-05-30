import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './services/auth.service';
import { GoogleRequest } from './strategies/google.auth.strategy';

@Controller('auth/google')
export class GoogleAuthController {
  constructor(private authService: AuthService) {}

  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // As this method is protected by Google Auth guard, it will trigger Google SSO flow
    return;
  }

  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: GoogleRequest, @Res() res: Response) {
    const user = await this.authService.upsertUser(req.user);

    if (!user) {
      throw new HttpException(
        { reason: 'User email domain does not match an existing workspace' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const refreshToken = await this.authService.registerRefreshToken(user);
    return res.redirect(
      this.authService.computeRedirectURI(refreshToken.refreshToken),
    );
  }
}
