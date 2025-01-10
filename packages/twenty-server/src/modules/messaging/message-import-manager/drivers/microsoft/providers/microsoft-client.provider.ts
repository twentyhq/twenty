import { Injectable } from '@nestjs/common';

import { Client } from '@microsoft/microsoft-graph-client';

import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class MicrosoftClientProvider {
  constructor(
    private readonly microsoftOAuth2ClientManagerService: MicrosoftOAuth2ClientManagerService,
  ) {}

  public async getMicrosoftClient(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'refreshToken' | 'id'
    >,
  ): Promise<Client> {
    try {
      return await this.microsoftOAuth2ClientManagerService.getOAuth2Client(
        connectedAccount.refreshToken,
      );
    } catch (error) {
      throw new Error(
        `Failed to get Microsoft client: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }
}
