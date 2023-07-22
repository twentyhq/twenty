import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Request } from 'express';

import { EnvironmentService } from 'src/integrations/environment/environment.service';

export type GoogleRequest = Request & {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    workspaceInviteHash?: string;
  };
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(environmentService: EnvironmentService) {
    super({
      clientID: environmentService.getAuthGoogleClientId(),
      clientSecret: environmentService.getAuthGoogleClientSecret(),
      callbackURL: environmentService.getAuthGoogleCallbackUrl(),
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  authenticate(req: any, options: any) {
    options = {
      ...options,
      state: JSON.stringify({
        workspaceInviteHash: req.params.workspaceInviteHash,
      }),
    };

    return super.authenticate(req, options);
  }

  async validate(
    request: GoogleRequest,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    const { name, emails } = profile;
    const state =
      typeof request.query.state === 'string'
        ? JSON.parse(request.query.state)
        : undefined;

    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      workspaceInviteHash: state.workspaceInviteHash,
    };
    done(null, user);
  }
}
