import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type SendAppMessageEmail } from 'twenty-shared/application';
import {
  MessageChannelType,
  MessageParticipantRole,
} from 'twenty-shared/types';
import {
  convertEmailBodyToEmailDocument,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { MAX_APP_MESSAGE_TEXT_LENGTH } from 'src/engine/metadata-modules/message-channel/dtos/ingest-app-messages.input';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { compileOutboundEmailContent } from 'src/engine/core-modules/email/utils/compile-outbound-email-content.util';
import { sanitizeOutboundEmailSubject } from 'src/engine/core-modules/email/utils/sanitize-outbound-email-html.util';
import { getEmailRecipientsError } from 'src/engine/core-modules/email/utils/get-email-recipients-error.util';
import { parseCommaSeparatedEmails } from 'src/engine/core-modules/email/utils/parse-comma-separated-emails.util';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { type SendAppChannelMessageEmailInput } from 'src/engine/metadata-modules/message-channel/dtos/send-app-channel-message.input';
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
import { withKnownParticipantIdentities } from 'src/engine/metadata-modules/message-channel/utils/with-known-participant-identities.util';
import { MessagingProviderMessageSenderService } from 'src/engine/metadata-modules/messaging-provider/services/messaging-provider-message-sender.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

const CONVERSATION_LOOKUP_MESSAGE_LIMIT = 50;

const APP_MESSAGE_DELIVERY_TTL_MS = 24 * 60 * 60 * 1000;

const APP_MESSAGE_DELIVERY_LOCK_OPTIONS = { ms: 500, maxRetries: 60 };

type SendArgs = {
  workspaceId: string;
  userWorkspaceId: string;
  messageChannelId: string;
  messageThreadId: string;
  text?: string;
  email?: SendAppChannelMessageEmailInput;
  idempotencyKey: string;
};

type Conversation = {
  threadExternalId: string;
  recipients: AppMessageReplyRecipient[];
};

type ValidatedAppReply = {
  text: string;
  recipients: {
    to: AppMessageReplyRecipient[];
    cc: AppMessageReplyRecipient[];
    bcc: AppMessageReplyRecipient[];
  } | null;
  email:
    | (Pick<SendAppMessageEmail, 'subject' | 'html'> & {
        inReplyToHeaderMessageId: string | null;
      })
    | null;
};

type AppMessageDelivery = Conversation & {
  externalId: string;
  text: string;
  sentAt: string;
  subject: string | null;
  cc: AppMessageReplyRecipient[];
  bcc: AppMessageReplyRecipient[];
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
    private readonly cacheLockService: CacheLockService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async send({
    workspaceId,
    userWorkspaceId,
    messageChannelId,
    messageThreadId,
    text,
    email,
    idempotencyKey,
  }: SendArgs): Promise<SendAppChannelMessageOutput> {
    const reply = await this.validateReplyOrThrow({ text, email });

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

    const { applicationId, connectionProviderId } = connectedAccount;

    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    const deliveryKey = `app-message-delivery:${workspaceId}:${userWorkspaceId}:${messageChannelId}:${messageThreadId}:${idempotencyKey}`;

    return this.cacheLockService.withLock(
      async () => {
        const delivery =
          (await this.cacheStorageService.get<AppMessageDelivery>(
            deliveryKey,
          )) ??
          (await this.deliver({
            workspaceId,
            messageChannel,
            connectionProviderId,
            connectedAccountId: connectedAccount.id,
            messageThreadId,
            idempotencyKey,
            reply,
            deliveryKey,
          }));

        const {
          messages: [ingestedMessage],
        } = await this.applicationMessageIngestionService.ingest({
          applicationId,
          workspaceId,
          requestUserWorkspaceId: userWorkspaceId,
          messageChannelId,
          messages: [
            {
              externalId: delivery.externalId,
              threadExternalId: delivery.threadExternalId,
              subject: delivery.subject ?? undefined,
              text: delivery.text,
              receivedAt: new Date(delivery.sentAt),
              participants: [
                {
                  role: MessageParticipantRole.FROM,
                  handle: messageChannel.handle,
                  displayName: messageChannel.displayName ?? undefined,
                  workspaceMemberId:
                    flatWorkspaceMemberMaps.idByUserWorkspaceId[
                      userWorkspaceId
                    ],
                },
                ...delivery.recipients.map((recipient) => ({
                  role: MessageParticipantRole.TO,
                  ...recipient,
                })),
                ...(delivery.cc ?? []).map((recipient) => ({
                  role: MessageParticipantRole.CC,
                  ...recipient,
                })),
                ...(delivery.bcc ?? []).map((recipient) => ({
                  role: MessageParticipantRole.BCC,
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
      },
      deliveryKey,
      APP_MESSAGE_DELIVERY_LOCK_OPTIONS,
    );
  }

  private async deliver({
    workspaceId,
    messageChannel,
    connectionProviderId,
    connectedAccountId,
    messageThreadId,
    idempotencyKey,
    reply,
    deliveryKey,
  }: {
    workspaceId: string;
    messageChannel: MessageChannelEntity;
    connectionProviderId: string;
    connectedAccountId: string;
    messageThreadId: string;
    idempotencyKey: string;
    reply: ValidatedAppReply;
    deliveryKey: string;
  }): Promise<AppMessageDelivery> {
    const sender =
      await this.messagingProviderMessageSenderService.resolveSenderOrThrow({
        messagingProviderUniversalIdentifier:
          messageChannel.messagingProviderUniversalIdentifier,
        connectionProviderId,
        messageChannelId: messageChannel.id,
        workspaceId,
      });

    const isEmailStyle = sender.messagingProvider.conversationStyle === 'email';

    if (isEmailStyle !== isDefined(reply.email)) {
      throw new MessageChannelException(
        isEmailStyle
          ? `Messaging provider ${sender.messagingProvider.id} sends email-style replies: send an email`
          : `Messaging provider ${sender.messagingProvider.id} sends chat replies: send a text`,
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    const conversation = await this.findConversation({
      workspaceId,
      messageChannel,
      messageThreadId,
    });

    const withConversationIdentities = (
      replyRecipients: AppMessageReplyRecipient[],
    ) =>
      withKnownParticipantIdentities({
        recipients: replyRecipients,
        knownParticipants: conversation.recipients,
      });

    const recipients = isDefined(reply.recipients)
      ? withConversationIdentities(reply.recipients.to)
      : conversation.recipients;

    if (recipients.length === 0) {
      throw new MessageChannelException(
        `Message thread ${messageThreadId} has no participant to reply to`,
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    const cc = withConversationIdentities(reply.recipients?.cc ?? []);
    const bcc = withConversationIdentities(reply.recipients?.bcc ?? []);

    const inReplyToHeaderMessageId = reply.email?.inReplyToHeaderMessageId;

    const inReplyToExternalId = isDefined(inReplyToHeaderMessageId)
      ? await this.findMessageExternalId({
          workspaceId,
          messageChannelId: messageChannel.id,
          messageThreadId,
          headerMessageId: inReplyToHeaderMessageId,
        })
      : null;

    const toSendAppMessageRecipient = ({
      handle,
      displayName,
    }: AppMessageReplyRecipient) => ({
      handle,
      displayName: displayName ?? null,
    });

    const payloadBase = {
      messagingProviderName: sender.messagingProvider.name,
      connectedAccountId,
      messageChannelId: messageChannel.id,
      threadExternalId: conversation.threadExternalId,
      text: reply.text,
      idempotencyKey,
      recipients: recipients.map(toSendAppMessageRecipient),
    };

    const sentMessage =
      await this.messagingProviderMessageSenderService.sendOrThrow({
        sender,
        workspaceId,
        payload: isDefined(reply.email)
          ? {
              ...payloadBase,
              conversationStyle: 'email',
              email: {
                subject: reply.email.subject,
                html: reply.email.html,
                cc: cc.map(toSendAppMessageRecipient),
                bcc: bcc.map(toSendAppMessageRecipient),
                inReplyToExternalId,
              },
            }
          : { ...payloadBase, conversationStyle: 'chat' },
      });

    const delivery: AppMessageDelivery = {
      externalId: sentMessage.externalId,
      threadExternalId: conversation.threadExternalId,
      text: reply.text,
      sentAt: sentMessage.sentAt ?? new Date().toISOString(),
      recipients,
      subject: reply.email?.subject ?? null,
      cc,
      bcc,
    };

    await this.cacheStorageService.set(
      deliveryKey,
      delivery,
      APP_MESSAGE_DELIVERY_TTL_MS,
    );

    return delivery;
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
          const threadMessages = await this.workspaceOrmManager
            .getRepositoryWithoutPermissionChecks<MessageWorkspaceEntity>(
              'message',
            )
            .find({ where: { messageThreadId }, select: { id: true } });

          const threadMessageIds = threadMessages.map((message) => message.id);

          if (!isNonEmptyArray(threadMessageIds)) {
            return null;
          }

          const associations = await this.workspaceOrmManager
            .getRepositoryWithoutPermissionChecks<MessageChannelMessageAssociationWorkspaceEntity>(
              'messageChannelMessageAssociation',
            )
            .find({
              where: {
                messageChannelId: messageChannel.id,
                messageId: In(threadMessageIds),
              },
              select: { messageId: true, messageThreadExternalId: true },
            });

          if (!isNonEmptyArray(associations)) {
            return null;
          }

          const latestMessages = await this.workspaceOrmManager
            .getRepositoryWithoutPermissionChecks<MessageWorkspaceEntity>(
              'message',
            )
            .find({
              where: {
                id: In(
                  associations.map((association) => association.messageId),
                ),
              },
              select: { id: true },
              order: { receivedAt: 'DESC' },
              take: CONVERSATION_LOOKUP_MESSAGE_LIMIT,
            });

          const messageIds = latestMessages.map((message) => message.id);

          const participants = await this.workspaceOrmManager
            .getRepositoryWithoutPermissionChecks<MessageParticipantWorkspaceEntity>(
              'messageParticipant',
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

          const byRecency = <TRow extends { messageId: string }>(
            rows: TRow[],
          ): TRow[] =>
            messageIds.flatMap((messageId) =>
              rows.filter((row) => row.messageId === messageId),
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

    return conversation;
  }

  private async validateReplyOrThrow({
    text,
    email,
  }: {
    text?: string;
    email?: SendAppChannelMessageEmailInput;
  }): Promise<ValidatedAppReply> {
    if (!isDefined(email)) {
      return { text: text ?? '', recipients: null, email: null };
    }

    const bodyConversionResult = convertEmailBodyToEmailDocument(email.body);

    if (!bodyConversionResult.success) {
      throw new MessageChannelException(
        `Invalid email body: ${bodyConversionResult.error}`,
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    const { html, plainText } = await compileOutboundEmailContent(
      bodyConversionResult.document,
    );

    if (plainText.length > MAX_APP_MESSAGE_TEXT_LENGTH) {
      throw new MessageChannelException(
        `Email body is longer than ${MAX_APP_MESSAGE_TEXT_LENGTH} characters`,
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    const handles = {
      to: parseCommaSeparatedEmails(email.to),
      cc: parseCommaSeparatedEmails(email.cc),
      bcc: parseCommaSeparatedEmails(email.bcc),
    };

    const recipientsError = getEmailRecipientsError(handles);

    if (isDefined(recipientsError)) {
      throw new MessageChannelException(
        'Invalid email recipients',
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
        { userFriendlyMessage: recipientsError },
      );
    }

    const toRecipients = (recipientHandles: string[]) =>
      recipientHandles.map((handle) => ({ handle }));

    return {
      text: plainText,
      recipients: {
        to: toRecipients(handles.to),
        cc: toRecipients(handles.cc),
        bcc: toRecipients(handles.bcc),
      },
      email: {
        subject: await sanitizeOutboundEmailSubject(email.subject),
        html,
        inReplyToHeaderMessageId: email.inReplyTo ?? null,
      },
    };
  }

  private async findMessageExternalId({
    workspaceId,
    messageChannelId,
    messageThreadId,
    headerMessageId,
  }: {
    workspaceId: string;
    messageChannelId: string;
    messageThreadId: string;
    headerMessageId: string;
  }): Promise<string | null> {
    return this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const repliedMessage = await this.workspaceOrmManager
          .getRepositoryWithoutPermissionChecks<MessageWorkspaceEntity>(
            'message',
          )
          .findOne({
            where: { messageThreadId, headerMessageId },
            select: { id: true },
          });

        if (!isDefined(repliedMessage)) {
          return null;
        }

        const association = await this.workspaceOrmManager
          .getRepositoryWithoutPermissionChecks<MessageChannelMessageAssociationWorkspaceEntity>(
            'messageChannelMessageAssociation',
          )
          .findOne({
            where: { messageChannelId, messageId: repliedMessage.id },
            select: { messageExternalId: true },
          });

        return association?.messageExternalId ?? null;
      },
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }

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
      .getRepositoryWithoutPermissionChecks(objectMetadataName)
      .find({ where: { id: In(definedIds) }, select: { id: true } });

    return new Set(records.map((record) => record.id));
  }
}
