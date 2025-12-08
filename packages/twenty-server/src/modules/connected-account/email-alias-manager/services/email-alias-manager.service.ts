import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { GoogleEmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/drivers/google/services/google-email-alias-manager.service';
import { MicrosoftEmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/drivers/microsoft/services/microsoft-email-alias-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class EmailAliasManagerService {
  constructor(
    private readonly googleEmailAliasManagerService: GoogleEmailAliasManagerService,
    private readonly microsoftEmailAliasManagerService: MicrosoftEmailAliasManagerService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  public async refreshHandleAliases(
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ) {
    let handleAliases: string[];

    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.MICROSOFT:
        handleAliases =
          await this.microsoftEmailAliasManagerService.getHandleAliases(
            connectedAccount,
          );
        break;
      case ConnectedAccountProvider.GOOGLE:
        handleAliases =
          await this.googleEmailAliasManagerService.getHandleAliases(
            connectedAccount,
          );
        break;
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
        // IMAP Protocol does not support email aliases
        handleAliases = [];
        break;
      default:
        assertUnreachable(
          connectedAccount.provider,
          `Email alias manager for provider ${connectedAccount.provider} is not implemented`,
        );
    }

    const { workspaceId } = this.scopedWorkspaceContextFactory.create();
    if (!workspaceId) {
      throw new Error('Workspace not found');
    }

    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspaceId,
        'connectedAccount',
      );

    await connectedAccountRepository.update(
      { id: connectedAccount.id },
      {
        handleAliases: handleAliases.join(','), // TODO: modify handleAliases to be of fieldmetadatatype array
      },
    );
  }
}
