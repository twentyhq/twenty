import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './services/auth.service';

@Controller('auth/token')
export class TokenController {
  constructor(private authService: AuthService) {}

  @Post()
  async generateAccessToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).send('Refresh token not found');
    }

    const token = await this.authService.generateAccessToken(refreshToken);
    return res.send({ accessToken: token });
  }
}
