import { Injectable, Logger } from '@nestjs/common';

import { google, type Auth } from 'googleapis';
import { isDefined } from 'twenty-shared/utils';

import { getGoogleApisOauthScopes } from 'src/engine/core-modules/auth/utils/get-google-apis-oauth-scopes';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class GoogleServiceAccountManagerService {
  private readonly logger = new Logger(
    GoogleServiceAccountManagerService.name,
  );

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  isServiceAccountConfigured(): boolean {
    return isDefined(
      this.twentyConfigService.get('GOOGLE_SERVICE_ACCOUNT_KEY_JSON'),
    );
  }

  async getImpersonatedClient(
    targetEmail: string,
  ): Promise<Auth.OAuth2Client> {
    const keyJson = this.twentyConfigService.get(
      'GOOGLE_SERVICE_ACCOUNT_KEY_JSON',
    );

    if (!isDefined(keyJson)) {
      throw new Error(
        'GOOGLE_SERVICE_ACCOUNT_KEY_JSON is not configured',
      );
    }

    try {
      const key = JSON.parse(keyJson);

      const jwtClient = new google.auth.JWT({
        email: key.client_email,
        key: key.private_key,
        scopes: getGoogleApisOauthScopes(),
        subject: targetEmail,
      });

      await jwtClient.authorize();

      return jwtClient as unknown as Auth.OAuth2Client;
    } catch (error) {
      this.logger.error(
        `Error creating impersonated client for ${targetEmail}`,
        error,
      );

      throw error;
    }
  }
}
