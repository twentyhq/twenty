import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';

import { Response } from 'express';

import { User } from 'src/core/user/user.entity';
import { GoogleGmailProviderEnabledGuard } from 'src/core/auth/guards/google-gmail-provider-enabled.guard';
import { GoogleGmailOauthGuard } from 'src/core/auth/guards/google-gmail-oauth.guard';
import { GoogleGmailRequest } from 'src/core/auth/strategies/google-gmail.auth.strategy';
import { GoogleGmailService } from 'src/core/auth/services/google-gmail.service';
import { AuthUser } from 'src/decorators/auth-user.decorator';
import { TokenService } from 'src/core/auth/services/token.service';

@Controller('auth/google-gmail')
export class GoogleGmailAuthController {
  constructor(
    private readonly googleGmailService: GoogleGmailService,
    private readonly tokenService: TokenService,
  ) {}

  // @Get('generate-short-term-token')
  // @UseGuards(JwtAuthGuard)
  // async getShortTermToken(@AuthUser() user: User) {
  //   console.log(user);
  //   const token = await this.tokenService.generateShortTermToken(
  //     user.workspaceMember.id,
  //   );

  //   return token;
  // }

  @Get()
  @UseGuards(GoogleGmailProviderEnabledGuard, GoogleGmailOauthGuard)
  async googleAuth() {
    // As this method is protected by Google Auth guard, it will trigger Google SSO flow
    return;
  }

  @Get('get-access-token')
  @UseGuards(GoogleGmailProviderEnabledGuard, GoogleGmailOauthGuard)
  async googleAuthGetAccessToken(
    @Req() req: GoogleGmailRequest,
    @Res() res: Response,
    @AuthUser() user: User,
  ) {
    console.log('toto');

    const { user: gmailUser } = req;

    const { accessToken, refreshToken } = gmailUser;

    console.log('toto1');

    this.googleGmailService.saveConnectedAccount({
      accountOwner: user,
      type: 'gmail',
      accessToken,
      refreshToken,
    });

    console.log('toto2');

    return res.redirect('http://localhost:3001');
  }
}
