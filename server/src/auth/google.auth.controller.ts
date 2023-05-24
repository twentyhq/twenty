import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './services/auth.service';
import { Profile } from 'passport-google-oauth20';

@Controller('auth/google')
export class GoogleAuthController {
  constructor(private authService: AuthService) {}

  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = await this.authService.upsertUser(req.user as { firstName: string, lastName: string, email: string })

    if (!user) {
      return res.status(400).send('User not created');
    }
    const refreshToken = await this.authService.registerRefreshToken(user)
    return res.redirect(this.authService.computeRedirectURI(refreshToken.refreshToken));
  }
  
}