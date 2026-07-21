import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
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
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
  ) {}

  public async refreshHandleAliases(
    connectedAccount: ConnectedAccountEntity,
    workspaceId: string,
  ): Promise<string[]> {
    const accountHasMailbox = await this.messageChannelRepository.exists({
      where: { connectedAccountId: connectedAccount.id, workspaceId },
    });

    if (!accountHasMailbox) {
      return connectedAccount.handleAliases ?? [];
    }

    const handleAliases =
      await this.getHandleAliasesFromProvider(connectedAccount);

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

  private async getHandleAliasesFromProvider(
    connectedAccount: ConnectedAccountEntity,
  ): Promise<string[]> {
    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.MICROSOFT:
        return this.microsoftEmailAliasManagerService.getHandleAliases(
          connectedAccount,
        );
      case ConnectedAccountProvider.GOOGLE:
        return this.googleEmailAliasManagerService.getHandleAliases(
          connectedAccount,
        );
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
      case ConnectedAccountProvider.OIDC:
      case ConnectedAccountProvider.SAML:
      case ConnectedAccountProvider.EMAIL_GROUP:
      case ConnectedAccountProvider.APP:
        return [];
      default:
        return assertUnreachable(
          connectedAccount.provider,
          `Email alias manager for provider ${connectedAccount.provider} is not implemented`,
        );
    }
  }
}
