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
import { GoogleRequest } from '../strategies/google.auth.strategy';
import { UserService } from '../../user/user.service';
import { TokenService } from '../services/token.service';
import { GoogleProviderEnabledGuard } from '../guards/google-provider-enabled.guard';

@Controller('auth/google')
export class GoogleAuthController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @UseGuards(GoogleProviderEnabledGuard, AuthGuard('google'))
  async googleAuth() {
    // As this method is protected by Google Auth guard, it will trigger Google SSO flow
    return;
  }

  @Get('redirect')
  @UseGuards(GoogleProviderEnabledGuard, AuthGuard('google'))
  async googleAuthRedirect(@Req() req: GoogleRequest, @Res() res: Response) {
    const { firstName, lastName, email } = req.user;

    const user = await this.userService.createUser({
      data: {
        email,
        firstName: firstName ?? '',
        lastName: lastName ?? '',
        locale: 'en',
        settings: {
          create: {
            locale: 'en',
          },
        },
      },
    });

    if (!user) {
      throw new InternalServerErrorException(
        'User email domain does not match an existing workspace',
      );
    }

    const loginToken = await this.tokenService.generateLoginToken(user.email);

    return res.redirect(this.tokenService.computeRedirectURI(loginToken.token));
  }
}
