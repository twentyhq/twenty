import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

import { ConnectedAccountDataAccessService } from 'src/engine/metadata-modules/connected-account/data-access/services/connected-account-data-access.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { GoogleEmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/drivers/google/services/google-email-alias-manager.service';
import { MicrosoftEmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/drivers/microsoft/services/microsoft-email-alias-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class EmailAliasManagerService {
  constructor(
    private readonly googleEmailAliasManagerService: GoogleEmailAliasManagerService,
    private readonly microsoftEmailAliasManagerService: MicrosoftEmailAliasManagerService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly connectedAccountDataAccessService: ConnectedAccountDataAccessService,
  ) {}

  public async refreshHandleAliases(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
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
      case ConnectedAccountProvider.OIDC:
      case ConnectedAccountProvider.SAML:
        handleAliases = [];
        break;
      default:
        assertUnreachable(
          connectedAccount.provider,
          `Email alias manager for provider ${connectedAccount.provider} is not implemented`,
        );
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.connectedAccountDataAccessService.update(
        workspaceId,
        { id: connectedAccount.id },
        {
          handleAliases: handleAliases.join(','), // TODO: modify handleAliases to be of fieldmetadatatype array
        },
      );
    }, authContext);
  }
}
