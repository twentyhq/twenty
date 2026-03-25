import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class MicrosoftEmailAliasManagerService {
  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  public async getHandleAliases(
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ) {
    const microsoftClient =
      await this.oAuth2ClientManagerService.getMicrosoftOAuth2Client(
        connectedAccount,
      );

    const response = await microsoftClient
      .api('/me?$select=proxyAddresses')
      .get()
      .catch((error) => {
        throw new Error(`Failed to fetch email aliases: ${error.message}`);
      });

    const proxyAddresses = response.proxyAddresses;

    const handleAliases =
      proxyAddresses
        // @ts-expect-error legacy noImplicitAny
        ?.filter((address) => {
          return address.startsWith('SMTP:') === false;
        })
        // @ts-expect-error legacy noImplicitAny
        .map((address) => {
          return address.replace('smtp:', '').toLowerCase();
        })
        // @ts-expect-error legacy noImplicitAny
        .filter((address) => {
          return isNonEmptyString(address);
        }) || [];

    return handleAliases;
  }
}
