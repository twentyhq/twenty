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

type AssociationWithAccount = {
  messageId: string;
  messageExternalId: string;
  connectedAccount: ConnectedAccountWorkspaceEntity;
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
    const results = await this.getThreadMessagesHtml([], workspaceId, [
      messageId,
    ]);

    return results[0]?.html ?? null;
  }

  async getThreadMessagesHtml(
    messageThreadIds: string[],
    workspaceId: string,
    directMessageIds?: string[],
  ): Promise<MessageHtmlResult[]> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        // Resolve message IDs from thread IDs or use directly provided ones
        const messageIds = isDefined(directMessageIds)
          ? directMessageIds
          : await this.getMessageIdsFromThreads(messageThreadIds, workspaceId);

        if (messageIds.length === 0) {
          return [];
        }

        // Get associations with resolved connected accounts in batch
        const associations = await this.resolveAssociations(
          messageIds,
          workspaceId,
        );

        if (associations.length === 0) {
          return [];
        }

        // Group by provider + account ID for batch fetching
        return this.fetchHtmlBatch(associations);
      },
      authContext,
    );
  }

  private async getMessageIdsFromThreads(
    messageThreadIds: string[],
    workspaceId: string,
  ): Promise<string[]> {
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
      select: { id: true },
    });

    return messages.map((message) => message.id);
  }

  private async resolveAssociations(
    messageIds: string[],
    workspaceId: string,
  ): Promise<AssociationWithAccount[]> {
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

    // Resolve connected accounts per channel (deduplicated)
    const channelIds = [
      ...new Set(associations.map((a) => a.messageChannelId)),
    ];

    const accountByChannelId = new Map<
      string,
      ConnectedAccountWorkspaceEntity
    >();

    // Fetch all channels in one query
    const channelRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
        { shouldBypassPermissionChecks: true },
      );

    const channels = await channelRepository.find({
      where: channelIds.map((id) => ({ id })),
      select: { id: true, connectedAccountId: true },
    });

    const connectedAccountIds = [
      ...new Set(channels.map((c) => c.connectedAccountId)),
    ];

    // Fetch all connected accounts in one query
    const accountRepository =
      await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
        workspaceId,
        'connectedAccount',
        { shouldBypassPermissionChecks: true },
      );

    const accounts = await accountRepository.find({
      where: connectedAccountIds.map((id) => ({ id })),
    });

    const accountById = new Map(accounts.map((a) => [a.id, a]));

    for (const channel of channels) {
      const account = accountById.get(channel.connectedAccountId);

      if (isDefined(account)) {
        accountByChannelId.set(channel.id, account);
      }
    }

    // Refresh tokens per unique account (one refresh per account, not per message)
    const refreshedAccountIds = new Set<string>();

    for (const account of accountByChannelId.values()) {
      if (!refreshedAccountIds.has(account.id)) {
        refreshedAccountIds.add(account.id);

        try {
          await this.connectedAccountRefreshTokensService.refreshAndSaveTokens(
            account,
            workspaceId,
          );
        } catch (error) {
          this.logger.warn(
            `Failed to refresh tokens for account ${account.id}: ${error}`,
          );
        }
      }
    }

    // Build resolved associations
    const result: AssociationWithAccount[] = [];

    for (const association of associations) {
      if (!association.messageExternalId) {
        continue;
      }

      const account = accountByChannelId.get(association.messageChannelId);

      if (!isDefined(account)) {
        continue;
      }

      result.push({
        messageId: association.messageId,
        messageExternalId: association.messageExternalId,
        connectedAccount: account,
      });
    }

    return result;
  }

  private async fetchHtmlBatch(
    associations: AssociationWithAccount[],
  ): Promise<MessageHtmlResult[]> {
    // Group by provider + account ID for batch fetching
    const gmailAssociations: AssociationWithAccount[] = [];
    const microsoftAssociations: AssociationWithAccount[] = [];
    const imapAssociations: AssociationWithAccount[] = [];

    for (const association of associations) {
      switch (association.connectedAccount.provider) {
        case ConnectedAccountProvider.GOOGLE:
          gmailAssociations.push(association);
          break;
        case ConnectedAccountProvider.MICROSOFT:
          microsoftAssociations.push(association);
          break;
        case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
          imapAssociations.push(association);
          break;
      }
    }

    const results: MessageHtmlResult[] = [];

    // Gmail: batch all messages per account through batched client
    if (gmailAssociations.length > 0) {
      const byAccountId = new Map<string, AssociationWithAccount[]>();

      for (const association of gmailAssociations) {
        const accountId = association.connectedAccount.id;
        const group = byAccountId.get(accountId) ?? [];

        group.push(association);
        byAccountId.set(accountId, group);
      }

      for (const [, accountAssociations] of byAccountId) {
        const externalIds = accountAssociations.map((a) => a.messageExternalId);

        const externalIdToMessageId = new Map(
          accountAssociations.map((a) => [a.messageExternalId, a.messageId]),
        );

        try {
          const htmlResults =
            await this.gmailHtmlPreviewService.getMessagesHtml(
              externalIds,
              accountAssociations[0].connectedAccount,
            );

          for (const htmlResult of htmlResults) {
            const messageId = externalIdToMessageId.get(
              htmlResult.messageExternalId,
            );

            if (isDefined(messageId)) {
              results.push({ messageId, html: htmlResult.html });
            }
          }
        } catch (error) {
          this.logger.warn(`Gmail batch fetch failed: ${error}`);

          for (const association of accountAssociations) {
            results.push({ messageId: association.messageId, html: null });
          }
        }
      }
    }

    // Microsoft/IMAP: sequential for now (stubs)
    for (const association of microsoftAssociations) {
      const html = await this.microsoftHtmlPreviewService.getMessageHtml(
        association.messageExternalId,
      );

      results.push({ messageId: association.messageId, html });
    }

    for (const association of imapAssociations) {
      const html = await this.imapHtmlPreviewService.getMessageHtml(
        association.messageExternalId,
      );

      results.push({ messageId: association.messageId, html });
    }

    return results;
  }
}
