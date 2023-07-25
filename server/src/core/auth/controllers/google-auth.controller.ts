import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';

import { Response } from 'express';

import { GoogleRequest } from 'src/core/auth/strategies/google.auth.strategy';
import { UserService } from 'src/core/user/user.service';
import { TokenService } from 'src/core/auth/services/token.service';
import { GoogleProviderEnabledGuard } from 'src/core/auth/guards/google-provider-enabled.guard';
import { GoogleOauthGuard } from 'src/core/auth/guards/google-oauth.guard';
import { WorkspaceService } from 'src/core/workspace/services/workspace.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

@Controller('auth/google')
export class GoogleAuthController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly workspaceService: WorkspaceService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @Get()
  @UseGuards(GoogleProviderEnabledGuard, GoogleOauthGuard)
  async googleAuth() {
    // As this method is protected by Google Auth guard, it will trigger Google SSO flow
    return;
  }

  @Get('redirect')
  @UseGuards(GoogleProviderEnabledGuard, GoogleOauthGuard)
  async googleAuthRedirect(@Req() req: GoogleRequest, @Res() res: Response) {
    const { firstName, lastName, email, workspaceInviteHash } = req.user;

    let workspaceId: string | undefined = undefined;
    if (workspaceInviteHash) {
      const workspace = await this.workspaceService.findFirst({
        where: {
          inviteHash: workspaceInviteHash,
        },
      });

      if (!workspace) {
        return res.redirect(
          `${this.environmentService.getFrontAuthCallbackUrl()}`,
        );
      }

      workspaceId = workspace.id;
    }

    const user = await this.userService.createUser(
      {
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
      },
      workspaceId,
    );

    const loginToken = await this.tokenService.generateLoginToken(user.email);

    return res.redirect(this.tokenService.computeRedirectURI(loginToken.token));
  }
}
