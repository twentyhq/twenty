import { Injectable } from '@nestjs/common';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';

@Injectable()
export class MicrosoftEmailAliasManagerService {
  constructor(
    private readonly microsoftClientProvider: MicrosoftClientProvider,
  ) {}

  public async getHandleAliases(
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ) {
    const microsoftClient =
      await this.microsoftClientProvider.getMicrosoftClient(connectedAccount);

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
          return address !== '';
        }) || [];

    return handleAliases;
  }
}
