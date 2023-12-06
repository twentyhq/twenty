import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import url from 'url';

import { Response } from 'express';
import { Repository } from 'typeorm';

import { GoogleRequest } from 'src/core/auth/strategies/google.auth.strategy';
import { TokenService } from 'src/core/auth/services/token.service';
import { User } from 'src/core/user/user.entity';
import { Workspace } from 'src/core/workspace/workspace.entity';
import { AuthService } from 'src/core/auth/services/auth.service';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { GoogleGmailProviderEnabledGuard } from 'src/core/auth/guards/google-gmail-provider-enabled.guard';
import { GoogleGmailOauthGuard } from 'src/core/auth/guards/google-gmail-oauth.guard';

@Controller('auth/google-gmail')
export class GoogleGmailAuthController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly environmentService: EnvironmentService,
    private readonly typeORMService: TypeORMService,
    private readonly authService: AuthService,
    @InjectRepository(Workspace, 'core')
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
  ) {}

  @Get()
  @UseGuards(GoogleGmailProviderEnabledGuard, GoogleGmailOauthGuard)
  async googleAuth() {
    // As this method is protected by Google Auth guard, it will trigger Google SSO flow
    return;
  }

  @Get('get-access-token')
  @UseGuards(GoogleGmailProviderEnabledGuard, GoogleGmailOauthGuard)
  async googleAuthGetAccessToken(
    @Req() req: GoogleRequest,
    @Res() res: Response,
  ) {
    //console.log(res);

    // Receive the callback from Google's OAuth 2.0 server.

    // Handle the OAuth 2.0 server response
    const q = url.parse(req.url, true).query;

    const code = q.code as string;

    console.log(code);

    // POST /token HTTP/1.1
    // Host: oauth2.googleapis.com
    // Content-Type: application/x-www-form-urlencoded

    // code=4/P7q7W91a-oMsCeLvIaQm6bTrgtp7&
    // client_id=your_client_id&
    // client_secret=your_client_secret&
    // redirect_uri=https%3A//oauth2.example.com/code&
    // grant_type=authorization_code

    // const response = await fetch('https://oauth2.googleapis.com/token', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   body: `code=${code}&client_id=${this.environmentService.getAuthGoogleClientId()}&client_secret=${this.environmentService.getAuthGoogleClientSecret()}&redirect_uri=http://localhost:3000/auth/google-gmail/redirect&grant_type=authorization_code`,
    // });

    // console.log(response);

    // const json = await response.json();

    // console.log(json);

    return;
  }

  @Get('redirect')
  @UseGuards(GoogleGmailProviderEnabledGuard, GoogleGmailOauthGuard)
  async googleAuthRedirect(@Req() req: GoogleRequest, @Res() res: Response) {
    console.log(req);
    return res.redirect('http://localhost:3001');
  }
}
