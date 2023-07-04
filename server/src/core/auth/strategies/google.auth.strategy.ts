import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

export type GoogleRequest = Request & {
  user: {
    firstName: string | undefined | null;
    lastName: string | undefined | null;
    email: string;
  };
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(environmentService: EnvironmentService) {
    const isAuthGoogleEnabled = environmentService.getAuthGoogleEnabled();
    super({
      clientID: isAuthGoogleEnabled
        ? environmentService.getAuthGoogleClientId()
        : 'disabled',
      clientSecret: isAuthGoogleEnabled
        ? environmentService.getAuthGoogleClientSecret()
        : 'disabled',
      callbackURL: isAuthGoogleEnabled
        ? environmentService.getAuthGoogleCallbackUrl()
        : 'disabled',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      refreshToken,
      accessToken,
    };
    done(null, user);
  }
}
