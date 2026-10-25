import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  MessageChannelType,
  MessageParticipantRole,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { type SendAppChannelMessageOutput } from 'src/engine/metadata-modules/message-channel/dtos/send-app-channel-message.output';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import {
  MessageChannelException,
  MessageChannelExceptionCode,
} from 'src/engine/metadata-modules/message-channel/message-channel.exception';
import { ApplicationMessageIngestionService } from 'src/engine/metadata-modules/message-channel/services/application-message-ingestion.service';
import {
  type AppMessageReplyRecipient,
  buildAppMessageReplyRecipients,
} from 'src/engine/metadata-modules/message-channel/utils/build-app-message-reply-recipients.util';
import { MessagingProviderMessageSenderService } from 'src/engine/metadata-modules/messaging-provider/services/messaging-provider-message-sender.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

// recipients and the provider thread id come from the latest messages; older ones only slow the lookup
const CONVERSATION_LOOKUP_MESSAGE_LIMIT = 50;

type SendArgs = {
  workspaceId: string;
  userWorkspaceId: string;
  messageChannelId: string;
  messageThreadId: string;
  text: string;
};

type Conversation = {
  threadExternalId: string;
  recipients: AppMessageReplyRecipient[];
};

@Injectable()
export class ApplicationMessageSendService {
  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
    private readonly messagingProviderMessageSenderService: MessagingProviderMessageSenderService,
    private readonly applicationMessageIngestionService: ApplicationMessageIngestionService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async send({
    workspaceId,
    userWorkspaceId,
    messageChannelId,
    messageThreadId,
    text,
  }: SendArgs): Promise<SendAppChannelMessageOutput> {
    const messageChannel = await this.messageChannelRepository.findOne({
      where: {
        id: messageChannelId,
        workspaceId,
        type: MessageChannelType.APP,
      },
    });

    if (!isDefined(messageChannel)) {
      throw new MessageChannelException(
        `Message channel ${messageChannelId} not found`,
        MessageChannelExceptionCode.MESSAGE_CHANNEL_NOT_FOUND,
      );
    }

    // checked before sending: the ingestion that records the message would refuse it after delivery
    if (!messageChannel.isSyncEnabled) {
      throw new MessageChannelException(
        `Message channel ${messageChannelId} has sync disabled`,
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    const connectedAccount =
      await this.connectedAccountMetadataService.verifyUsableByCaller({
        id: messageChannel.connectedAccountId,
        userWorkspaceId,
        workspaceId,
      });

    if (
      !isDefined(connectedAccount.applicationId) ||
      !isDefined(connectedAccount.connectionProviderId)
    ) {
      throw new MessageChannelException(
        `Message channel ${messageChannelId} is not backed by an application connection`,
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    const sender =
      await this.messagingProviderMessageSenderService.resolveSenderOrThrow({
        messagingProviderUniversalIdentifier:
          messageChannel.messagingProviderUniversalIdentifier,
        connectionProviderId: connectedAccount.connectionProviderId,
        messageChannelId,
        workspaceId,
      });

    const conversation = await this.findConversation({
      workspaceId,
      messageChannel,
      messageThreadId,
    });

    const sentMessage =
      await this.messagingProviderMessageSenderService.sendOrThrow({
        sender,
        workspaceId,
        payload: {
          connectedAccountId: connectedAccount.id,
          messageChannelId,
          threadExternalId: conversation.threadExternalId,
          text,
          recipients: conversation.recipients.map(
            ({ handle, displayName }) => ({
              handle,
              displayName: displayName ?? null,
            }),
          ),
        },
      });

    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    // the provider usually echoes the sent message back through the app's webhook; the shared externalId makes that a no-op
    const {
      messages: [ingestedMessage],
    } = await this.applicationMessageIngestionService.ingest({
      applicationId: connectedAccount.applicationId,
      workspaceId,
      requestUserWorkspaceId: userWorkspaceId,
      messageChannelId,
      messages: [
        {
          externalId: sentMessage.externalId,
          threadExternalId: conversation.threadExternalId,
          text,
          receivedAt: isDefined(sentMessage.sentAt)
            ? new Date(sentMessage.sentAt)
            : new Date(),
          participants: [
            {
              role: MessageParticipantRole.FROM,
              handle: messageChannel.handle,
              displayName: messageChannel.displayName ?? undefined,
              workspaceMemberId:
                flatWorkspaceMemberMaps.idByUserWorkspaceId[userWorkspaceId],
            },
            ...conversation.recipients.map((recipient) => ({
              role: MessageParticipantRole.TO,
              ...recipient,
            })),
          ],
        },
      ],
    });

    return {
      messageId: ingestedMessage.messageId,
      messageThreadId: ingestedMessage.messageThreadId,
    };
  }

  private async findConversation({
    workspaceId,
    messageChannel,
    messageThreadId,
  }: {
    workspaceId: string;
    messageChannel: Pick<MessageChannelEntity, 'id' | 'handle'>;
    messageThreadId: string;
  }): Promise<Conversation> {
    const conversation =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const latestMessages = await this.workspaceOrmManager
            .getRepository<MessageWorkspaceEntity>('message', {
              shouldBypassPermissionChecks: true,
            })
            .find({
              where: { messageThreadId },
              select: { id: true },
              order: { receivedAt: 'DESC' },
              take: CONVERSATION_LOOKUP_MESSAGE_LIMIT,
            });

          const messageIds = latestMessages.map((message) => message.id);

          if (messageIds.length === 0) {
            return null;
          }

          const associations = await this.workspaceOrmManager
            .getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
              'messageChannelMessageAssociation',
              { shouldBypassPermissionChecks: true },
            )
            .find({
              where: {
                messageChannelId: messageChannel.id,
                messageId: In(messageIds),
              },
              select: { messageId: true, messageThreadExternalId: true },
            });

          const participants = await this.workspaceOrmManager
            .getRepository<MessageParticipantWorkspaceEntity>(
              'messageParticipant',
              { shouldBypassPermissionChecks: true },
            )
            .find({
              where: { messageId: In(messageIds) },
              select: {
                messageId: true,
                handle: true,
                displayName: true,
                personId: true,
                workspaceMemberId: true,
                role: true,
              },
            });

          const recencyByMessageId = new Map(
            messageIds.map((messageId, index) => [messageId, index]),
          );
          const byRecency = <TRow extends { messageId: string }>(
            rows: TRow[],
          ): TRow[] =>
            [...rows].sort(
              (rowA, rowB) =>
                (recencyByMessageId.get(rowA.messageId) ?? 0) -
                (recencyByMessageId.get(rowB.messageId) ?? 0),
            );

          const threadExternalId = byRecency(associations).find((association) =>
            isDefined(association.messageThreadExternalId),
          )?.messageThreadExternalId;

          if (!isDefined(threadExternalId)) {
            return null;
          }

          return {
            threadExternalId,
            recipients: await this.dropLinksToDeletedRecords(
              buildAppMessageReplyRecipients({
                participants: byRecency(participants),
                channelHandle: messageChannel.handle,
              }),
            ),
          };
        },
        buildSystemAuthContext(workspaceId),
        { lite: true },
      );

    if (!isDefined(conversation)) {
      throw new MessageChannelException(
        `Message thread ${messageThreadId} has no messages in message channel ${messageChannel.id}`,
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    if (conversation.recipients.length === 0) {
      throw new MessageChannelException(
        `Message thread ${messageThreadId} has no participant to reply to`,
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    return conversation;
  }

  // ingestion refuses links to deleted records, and by then the provider has already delivered the message
  private async dropLinksToDeletedRecords(
    recipients: Conversation['recipients'],
  ): Promise<Conversation['recipients']> {
    const [existingPersonIds, existingWorkspaceMemberIds] = await Promise.all([
      this.findExistingRecordIds({
        objectMetadataName: 'person',
        ids: recipients.map((recipient) => recipient.personId),
      }),
      this.findExistingRecordIds({
        objectMetadataName: 'workspaceMember',
        ids: recipients.map((recipient) => recipient.workspaceMemberId),
      }),
    ]);

    return recipients.map((recipient) => ({
      ...recipient,
      personId:
        isDefined(recipient.personId) &&
        existingPersonIds.has(recipient.personId)
          ? recipient.personId
          : undefined,
      workspaceMemberId:
        isDefined(recipient.workspaceMemberId) &&
        existingWorkspaceMemberIds.has(recipient.workspaceMemberId)
          ? recipient.workspaceMemberId
          : undefined,
    }));
  }

  private async findExistingRecordIds({
    objectMetadataName,
    ids,
  }: {
    objectMetadataName: 'person' | 'workspaceMember';
    ids: (string | undefined)[];
  }): Promise<Set<string>> {
    const definedIds = [...new Set(ids.filter(isDefined))];

    if (definedIds.length === 0) {
      return new Set();
    }

    const records = await this.workspaceOrmManager
      .getRepository(objectMetadataName, { shouldBypassPermissionChecks: true })
      .find({ where: { id: In(definedIds) }, select: { id: true } });

    return new Set(records.map((record) => record.id));
  }
}
