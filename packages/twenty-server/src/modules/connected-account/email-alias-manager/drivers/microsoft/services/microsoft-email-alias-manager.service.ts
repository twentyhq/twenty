import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { z } from 'zod';

import { MicrosoftOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client.provider';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

@Injectable()
export class MicrosoftEmailAliasManagerService {
  constructor(
    private readonly microsoftOAuth2ClientProvider: MicrosoftOAuth2ClientProvider,
  ) {}

  public async getHandleAliases(connectedAccount: ConnectedAccountEntity) {
    const microsoftClient = await this.microsoftOAuth2ClientProvider.getClient(
      connectedAccount.id,
    );

    const response = await microsoftClient
      .api('/me?$select=proxyAddresses')
      .get()
      .catch((error) => {
        throw new Error(`Failed to fetch email aliases: ${error.message}`);
      });

    const proxyAddresses = z
      .array(z.string())
      .nullish()
      .parse(response.proxyAddresses);

    const handleAliases =
      proxyAddresses
        ?.filter((address) => {
          return address.startsWith('SMTP:') === false;
        })
        .map((address) => {
          return address.replace('smtp:', '').toLowerCase();
        })
        .filter((address) => {
          return isNonEmptyString(address);
        }) || [];

    return handleAliases;
  }
}
