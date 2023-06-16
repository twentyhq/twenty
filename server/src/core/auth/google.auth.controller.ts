import {
  Controller,
  Get,
  InternalServerErrorException,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './services/auth.service';
import { GoogleRequest } from './strategies/google.auth.strategy';
import { UserService } from '../user/user.service';
import { assertNotNull } from 'src/utils/assert';

@Controller('auth/google')
export class GoogleAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // As this method is protected by Google Auth guard, it will trigger Google SSO flow
    return;
  }

  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: GoogleRequest, @Res() res: Response) {
    const { firstName, lastName, email } = req.user;
    const displayName = [firstName, lastName].filter(assertNotNull).join(' ');

    const user = await this.userService.createUser({
      data: {
        email,
        displayName,
        locale: 'en',
      },
    });

    if (!user) {
      throw new InternalServerErrorException(
        'User email domain does not match an existing workspace',
      );
    }

    const loginToken = await this.authService.generateLoginToken(user.email);

    return res.redirect(this.authService.computeRedirectURI(loginToken.token));
  }
}
