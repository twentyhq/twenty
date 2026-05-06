import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { GoogleEmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/drivers/google/services/google-email-alias-manager.service';
import { MicrosoftEmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/drivers/microsoft/services/microsoft-email-alias-manager.service';

@Injectable()
export class EmailAliasManagerService {
  constructor(
    private readonly googleEmailAliasManagerService: GoogleEmailAliasManagerService,
    private readonly microsoftEmailAliasManagerService: MicrosoftEmailAliasManagerService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  public async refreshHandleAliases(
    connectedAccount: ConnectedAccountEntity,
    workspaceId: string,
  ): Promise<string[]> {
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
      case ConnectedAccountProvider.APP:
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
      await this.connectedAccountRepository.update(
        { id: connectedAccount.id, workspaceId },
        {
          handleAliases,
        },
      );
    }, authContext);

    return handleAliases;
  }
}
