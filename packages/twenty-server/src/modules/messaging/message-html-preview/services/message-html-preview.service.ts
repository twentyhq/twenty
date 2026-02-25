import { Injectable, Logger } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { GmailHtmlPreviewService } from 'src/modules/messaging/message-html-preview/drivers/gmail/services/gmail-html-preview.service';
import { ImapHtmlPreviewService } from 'src/modules/messaging/message-html-preview/drivers/imap/services/imap-html-preview.service';
import { MicrosoftHtmlPreviewService } from 'src/modules/messaging/message-html-preview/drivers/microsoft/services/microsoft-html-preview.service';

type MessageHtmlResult = {
  messageId: string;
  html: string | null;
};

@Injectable()
export class MessageHtmlPreviewService {
  private readonly logger = new Logger(MessageHtmlPreviewService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly connectedAccountRefreshTokensService: ConnectedAccountRefreshTokensService,
    private readonly gmailHtmlPreviewService: GmailHtmlPreviewService,
    private readonly microsoftHtmlPreviewService: MicrosoftHtmlPreviewService,
    private readonly imapHtmlPreviewService: ImapHtmlPreviewService,
  ) {}

  async getMessageHtml(
    messageId: string,
    workspaceId: string,
  ): Promise<string | null> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const association = await this.getMessageAssociation(
          messageId,
          workspaceId,
        );

        if (!association?.messageExternalId) {
          return null;
        }

        const connectedAccount = await this.getConnectedAccountForChannel(
          association.messageChannelId,
          workspaceId,
        );

        if (!connectedAccount) {
          return null;
        }

        await this.connectedAccountRefreshTokensService.refreshAndSaveTokens(
          connectedAccount,
          workspaceId,
        );

        return this.fetchHtmlFromProvider(
          connectedAccount,
          association.messageExternalId,
        );
      },
      authContext,
    );
  }

  async getThreadMessagesHtml(
    messageThreadIds: string[],
    workspaceId: string,
  ): Promise<MessageHtmlResult[]> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const messageRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageWorkspaceEntity>(
            workspaceId,
            'message',
            { shouldBypassPermissionChecks: true },
          );

        const messages = await messageRepository.find({
          where: messageThreadIds.map((threadId) => ({
            messageThreadId: threadId,
          })),
          select: { id: true, messageThreadId: true },
        });

        if (messages.length === 0) {
          return [];
        }

        const messageIds = messages.map((message) => message.id);

        const associationRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
            workspaceId,
            'messageChannelMessageAssociation',
            { shouldBypassPermissionChecks: true },
          );

        const associations = await associationRepository.find({
          where: messageIds.map((id) => ({ messageId: id })),
          select: {
            messageId: true,
            messageExternalId: true,
            messageChannelId: true,
          },
        });

        // Group by connected account to reuse OAuth clients
        const channelIds = [
          ...new Set(associations.map((a) => a.messageChannelId)),
        ];

        const connectedAccountByChannelId = new Map<
          string,
          ConnectedAccountWorkspaceEntity
        >();

        for (const channelId of channelIds) {
          const account = await this.getConnectedAccountForChannel(
            channelId,
            workspaceId,
          );

          if (isDefined(account)) {
            await this.connectedAccountRefreshTokensService.refreshAndSaveTokens(
              account,
              workspaceId,
            );
            connectedAccountByChannelId.set(channelId, account);
          }
        }

        const results: MessageHtmlResult[] = [];

        for (const association of associations) {
          if (!association.messageExternalId) {
            continue;
          }

          const connectedAccount = connectedAccountByChannelId.get(
            association.messageChannelId,
          );

          if (!connectedAccount) {
            continue;
          }

          try {
            const html = await this.fetchHtmlFromProvider(
              connectedAccount,
              association.messageExternalId,
            );

            results.push({ messageId: association.messageId, html });
          } catch (error) {
            this.logger.warn(
              `Failed to fetch HTML for message ${association.messageId}: ${error}`,
            );
            results.push({ messageId: association.messageId, html: null });
          }
        }

        return results;
      },
      authContext,
    );
  }

  private async getMessageAssociation(
    messageId: string,
    workspaceId: string,
  ): Promise<MessageChannelMessageAssociationWorkspaceEntity | null> {
    const repository =
      await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
        workspaceId,
        'messageChannelMessageAssociation',
        { shouldBypassPermissionChecks: true },
      );

    return repository.findOne({
      where: { messageId },
      select: {
        messageExternalId: true,
        messageChannelId: true,
      },
    });
  }

  private async getConnectedAccountForChannel(
    messageChannelId: string,
    workspaceId: string,
  ): Promise<ConnectedAccountWorkspaceEntity | null> {
    const channelRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
        { shouldBypassPermissionChecks: true },
      );

    const channel = await channelRepository.findOne({
      where: { id: messageChannelId },
      select: { connectedAccountId: true },
    });

    if (!channel) {
      return null;
    }

    const accountRepository =
      await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
        workspaceId,
        'connectedAccount',
        { shouldBypassPermissionChecks: true },
      );

    return accountRepository.findOne({
      where: { id: channel.connectedAccountId },
    });
  }

  private async fetchHtmlFromProvider(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    messageExternalId: string,
  ): Promise<string | null> {
    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return this.gmailHtmlPreviewService.getMessageHtml(
          messageExternalId,
          connectedAccount,
        );
      case ConnectedAccountProvider.MICROSOFT:
        return this.microsoftHtmlPreviewService.getMessageHtml(
          messageExternalId,
        );
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
        return this.imapHtmlPreviewService.getMessageHtml(messageExternalId);
      default:
        return null;
    }
  }
}
