import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './services/auth.service';

@Controller('auth/token')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  generateAccessToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).send('Refresh token not found');
    }

    return res.send(this.authService.generateAccessToken(refreshToken));
  }
}