import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  type SendAppMessageAttachment,
  type SendAppMessageEmail,
  type StartAppConversationRecipient,
} from 'twenty-shared/application';
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
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { compileOutboundEmailContent } from 'src/engine/core-modules/email/utils/compile-outbound-email-content.util';
import { sanitizeOutboundEmailSubject } from 'src/engine/core-modules/email/utils/sanitize-outbound-email-html.util';
import { getEmailRecipientsError } from 'src/engine/core-modules/email/utils/get-email-recipients-error.util';
import { parseCommaSeparatedEmails } from 'src/engine/core-modules/email/utils/parse-comma-separated-emails.util';
import { FileEmailAttachmentService } from 'src/engine/core-modules/file/file-email-attachment/services/file-email-attachment.service';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import {
  type SendAppChannelMessageAttachmentInput,
  type SendAppChannelMessageEmailInput,
} from 'src/engine/metadata-modules/message-channel/dtos/send-app-channel-message.input';
import { type SendAppChannelMessageOutput } from 'src/engine/metadata-modules/message-channel/dtos/send-app-channel-message.output';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import {
  MessageChannelException,
  MessageChannelExceptionCode,
} from 'src/engine/metadata-modules/message-channel/message-channel.exception';
import { ApplicationMessageIngestionService } from 'src/engine/metadata-modules/message-channel/services/application-message-ingestion.service';
import { ApplicationMessageSendAttachmentsService } from 'src/engine/metadata-modules/message-channel/services/application-message-send-attachments.service';
import {
  type AppMessageReplyRecipient,
  buildAppMessageReplyRecipients,
} from 'src/engine/metadata-modules/message-channel/utils/build-app-message-reply-recipients.util';
import { withKnownParticipantIdentities } from 'src/engine/metadata-modules/message-channel/utils/with-known-participant-identities.util';
import {
  MessagingProviderException,
  MessagingProviderExceptionCode,
} from 'src/engine/metadata-modules/messaging-provider/messaging-provider.exception';
import { MessagingProviderMessageSenderService } from 'src/engine/metadata-modules/messaging-provider/services/messaging-provider-message-sender.service';
import { PermissionsException } from 'src/engine/permissions/permissions.exception';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { ApplicationThreadLatestMessagesService } from 'src/engine/metadata-modules/message-channel/services/application-thread-latest-messages.service';

const APP_MESSAGE_DELIVERY_TTL_MS = 24 * 60 * 60 * 1000;

const APP_MESSAGE_DELIVERY_LOCK_OPTIONS = { ms: 500, maxRetries: 180 };

const getAttachmentClaimKey = ({
  workspaceId,
  fileId,
}: {
  workspaceId: string;
  fileId: string;
}) => `app-message-attachment-claim:${workspaceId}:${fileId}`;

type SendArgs = {
  workspaceId: string;
  userWorkspaceId: string;
  messageChannelId: string;
  messageThreadId: string;
  text?: string;
  email?: SendAppChannelMessageEmailInput;
  idempotencyKey: string;
  attachments: SendAppChannelMessageAttachmentInput[];
};

type StartConversationArgs = Pick<
  SendArgs,
  'workspaceId' | 'userWorkspaceId' | 'messageChannelId' | 'idempotencyKey'
> & {
  personId: string;
  callerAuthContext: WorkspaceAuthContext;
  text: string;
};

type SendableChannel = {
  messageChannel: MessageChannelEntity;
  connectedAccountId: string;
  applicationId: string;
  connectionProviderId: string;
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
  attachments?: SendAppChannelMessageAttachmentInput[];
};

type DeliveryArguments = {
  workspaceId: string;
  messageChannel: MessageChannelEntity;
  connectionProviderId: string;
  connectedAccountId: string;
  messageThreadId: string;
  idempotencyKey: string;
  reply: ValidatedAppReply;
  attachments: SendAppChannelMessageAttachmentInput[];
  deliveryKey: string;
};

@Injectable()
export class ApplicationMessageSendService {
  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
    private readonly messagingProviderMessageSenderService: MessagingProviderMessageSenderService,
    private readonly applicationMessageIngestionService: ApplicationMessageIngestionService,
    private readonly applicationMessageSendAttachmentsService: ApplicationMessageSendAttachmentsService,
    private readonly fileEmailAttachmentService: FileEmailAttachmentService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly applicationThreadLatestMessagesService: ApplicationThreadLatestMessagesService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly cacheLockService: CacheLockService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async canStartConversation({
    messageChannel,
    workspaceId,
  }: {
    messageChannel: Pick<
      MessageChannelEntity,
      'type' | 'connectedAccountId' | 'messagingProviderUniversalIdentifier'
    >;
    workspaceId: string;
  }): Promise<boolean> {
    if (messageChannel.type !== MessageChannelType.APP) {
      return false;
    }

    const connectedAccount =
      await this.connectedAccountMetadataService.findById({
        id: messageChannel.connectedAccountId,
        workspaceId,
      });
    const connectionProviderId = connectedAccount?.connectionProviderId;

    if (!isDefined(connectionProviderId)) {
      return false;
    }

    return this.messagingProviderMessageSenderService.canStartConversation({
      messagingProviderUniversalIdentifier:
        messageChannel.messagingProviderUniversalIdentifier,
      connectionProviderId,
      workspaceId,
    });
  }

  async send({
    workspaceId,
    userWorkspaceId,
    messageChannelId,
    messageThreadId,
    text,
    email,
    idempotencyKey,
    attachments,
  }: SendArgs): Promise<SendAppChannelMessageOutput> {
    if (
      !isDefined(email) &&
      !isNonEmptyString(text) &&
      !isNonEmptyArray(attachments)
    ) {
      throw new MessageChannelException(
        'A message needs text or at least one attachment',
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
        {
          userFriendlyMessage: msg`A message needs text or at least one attachment.`,
        },
      );
    }

    const reply = await this.validateReplyOrThrow({ text, email });

    const sendableChannel = await this.findSendableChannelOrThrow({
      workspaceId,
      userWorkspaceId,
      messageChannelId,
    });

    return this.deliverOnceAndIngest({
      workspaceId,
      userWorkspaceId,
      sendableChannel,
      deliveryKey: `app-message-delivery:${workspaceId}:${userWorkspaceId}:${messageChannelId}:${messageThreadId}:${idempotencyKey}`,
      deliver: (deliveryKey) =>
        this.deliver({
          workspaceId,
          messageChannel: sendableChannel.messageChannel,
          connectionProviderId: sendableChannel.connectionProviderId,
          connectedAccountId: sendableChannel.connectedAccountId,
          messageThreadId,
          idempotencyKey,
          reply,
          attachments,
          deliveryKey,
        }),
    });
  }

  async startConversation({
    workspaceId,
    userWorkspaceId,
    messageChannelId,
    personId,
    callerAuthContext,
    text,
    idempotencyKey,
  }: StartConversationArgs): Promise<SendAppChannelMessageOutput> {
    const sendableChannel = await this.findSendableChannelOrThrow({
      workspaceId,
      userWorkspaceId,
      messageChannelId,
    });

    return this.deliverOnceAndIngest({
      workspaceId,
      userWorkspaceId,
      sendableChannel,
      deliveryKey: `app-conversation-start:${workspaceId}:${userWorkspaceId}:${messageChannelId}:${personId}:${idempotencyKey}`,
      deliver: (deliveryKey) =>
        this.deliverConversationStart({
          workspaceId,
          messageChannel: sendableChannel.messageChannel,
          connectionProviderId: sendableChannel.connectionProviderId,
          connectedAccountId: sendableChannel.connectedAccountId,
          personId,
          callerAuthContext,
          idempotencyKey,
          text,
          deliveryKey,
        }),
    });
  }

  private async findSendableChannelOrThrow({
    workspaceId,
    userWorkspaceId,
    messageChannelId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    messageChannelId: string;
  }): Promise<SendableChannel> {
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

    return {
      messageChannel,
      connectedAccountId: connectedAccount.id,
      applicationId: connectedAccount.applicationId,
      connectionProviderId: connectedAccount.connectionProviderId,
    };
  }

  private async deliverOnceAndIngest({
    workspaceId,
    userWorkspaceId,
    sendableChannel: { messageChannel, applicationId },
    deliveryKey,
    deliver,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    sendableChannel: Pick<SendableChannel, 'messageChannel' | 'applicationId'>;
    deliveryKey: string;
    deliver: (deliveryKey: string) => Promise<AppMessageDelivery>;
  }): Promise<SendAppChannelMessageOutput> {
    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    const sentMessageKey = `${deliveryKey}:sent`;

    return this.cacheLockService.withLock(
      async () => {
        const sentMessage =
          await this.cacheStorageService.get<SendAppChannelMessageOutput>(
            sentMessageKey,
          );

        if (isDefined(sentMessage)) {
          return sentMessage;
        }

        const delivery =
          (await this.cacheStorageService.get<AppMessageDelivery>(
            deliveryKey,
          )) ?? (await deliver(deliveryKey));

        const deliveredAttachments = delivery.attachments ?? [];

        const copiedAttachments =
          await this.applicationMessageSendAttachmentsService.copyIntoAttachmentFileFieldOrThrow(
            { attachments: deliveredAttachments, workspaceId },
          );

        try {
          const {
            messages: [ingestedMessage],
          } = await this.applicationMessageIngestionService.ingest({
            applicationId,
            workspaceId,
            requestUserWorkspaceId: userWorkspaceId,
            messageChannelId: messageChannel.id,
            messages: [
              {
                externalId: delivery.externalId,
                threadExternalId: delivery.threadExternalId,
                subject: delivery.subject ?? undefined,
                text: delivery.text,
                receivedAt: new Date(delivery.sentAt),
                attachments: copiedAttachments,
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

          const ingestedSentMessage = {
            messageId: ingestedMessage.messageId,
            messageThreadId: ingestedMessage.messageThreadId,
          };

          await this.cacheStorageService.set(
            sentMessageKey,
            ingestedSentMessage,
            APP_MESSAGE_DELIVERY_TTL_MS,
          );

          await this.fileEmailAttachmentService.deleteFiles({
            fileIds: deliveredAttachments.map(({ id }) => id),
            workspaceId,
          });

          return ingestedSentMessage;
        } finally {
          await this.applicationMessageSendAttachmentsService.deleteUnreferencedCopies(
            {
              copiedAttachments,
              workspaceId,
              messageChannelId: messageChannel.id,
              messageExternalId: delivery.externalId,
            },
          );
        }
      },
      deliveryKey,
      APP_MESSAGE_DELIVERY_LOCK_OPTIONS,
    );
  }

  private async claimAttachmentsOrThrow({
    attachments,
    workspaceId,
    deliveryKey,
  }: {
    attachments: SendAppChannelMessageAttachmentInput[];
    workspaceId: string;
    deliveryKey: string;
  }): Promise<void> {
    for (const { id, name } of attachments) {
      const claimKey = getAttachmentClaimKey({ workspaceId, fileId: id });

      const hasClaimed = await this.cacheStorageService.setIfAbsent(
        claimKey,
        deliveryKey,
        APP_MESSAGE_DELIVERY_TTL_MS,
      );

      if (
        !hasClaimed &&
        (await this.cacheStorageService.get<string>(claimKey)) !== deliveryKey
      ) {
        throw new MessageChannelException(
          `Attachment file ${name} (${id}) is already sent in another message`,
          MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
        );
      }
    }
  }

  private async releaseAttachmentClaims({
    attachments,
    workspaceId,
    deliveryKey,
  }: {
    attachments: SendAppChannelMessageAttachmentInput[];
    workspaceId: string;
    deliveryKey: string;
  }): Promise<void> {
    for (const { id } of attachments) {
      const claimKey = getAttachmentClaimKey({ workspaceId, fileId: id });

      if (
        (await this.cacheStorageService.get<string>(claimKey)) === deliveryKey
      ) {
        await this.cacheStorageService.del(claimKey);
      }
    }
  }

  private async deliver({
    workspaceId,
    messageChannel,
    connectionProviderId,
    connectedAccountId,
    messageThreadId,
    idempotencyKey,
    reply,
    attachments,
    deliveryKey,
  }: DeliveryArguments): Promise<AppMessageDelivery> {
    const attachmentsToSend =
      await this.applicationMessageSendAttachmentsService.buildAttachmentsToSendOrThrow(
        { attachments, workspaceId },
      );

    let delivery: AppMessageDelivery;

    try {
      await this.claimAttachmentsOrThrow({
        attachments,
        workspaceId,
        deliveryKey,
      });

      delivery = await this.sendClaimedDelivery({
        workspaceId,
        messageChannel,
        connectionProviderId,
        connectedAccountId,
        messageThreadId,
        idempotencyKey,
        reply,
        attachments,
        deliveryKey,
        attachmentsToSend,
      });
    } catch (error) {
      await this.releaseAttachmentClaims({
        attachments,
        workspaceId,
        deliveryKey,
      });

      throw error;
    }

    await this.cacheStorageService.set(
      deliveryKey,
      delivery,
      APP_MESSAGE_DELIVERY_TTL_MS,
    );

    return delivery;
  }

  private async sendClaimedDelivery({
    workspaceId,
    messageChannel,
    connectionProviderId,
    connectedAccountId,
    messageThreadId,
    idempotencyKey,
    reply,
    attachments,
    deliveryKey,
    attachmentsToSend,
  }: DeliveryArguments & {
    attachmentsToSend: SendAppMessageAttachment[];
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
      attachments: attachmentsToSend,
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

    return {
      externalId: sentMessage.externalId,
      threadExternalId: conversation.threadExternalId,
      text: reply.text,
      sentAt: sentMessage.sentAt ?? new Date().toISOString(),
      recipients,
      subject: reply.email?.subject ?? null,
      cc,
      bcc,
      attachments,
    };
  }

  private async deliverConversationStart({
    workspaceId,
    messageChannel,
    connectionProviderId,
    connectedAccountId,
    personId,
    callerAuthContext,
    idempotencyKey,
    text,
    deliveryKey,
  }: {
    workspaceId: string;
    messageChannel: MessageChannelEntity;
    connectionProviderId: string;
    connectedAccountId: string;
    personId: string;
    callerAuthContext: WorkspaceAuthContext;
    idempotencyKey: string;
    text: string;
    deliveryKey: string;
  }): Promise<AppMessageDelivery> {
    const conversationStarter =
      await this.messagingProviderMessageSenderService.resolveConversationStarterOrThrow(
        {
          messagingProviderUniversalIdentifier:
            messageChannel.messagingProviderUniversalIdentifier,
          connectionProviderId,
          messageChannelId: messageChannel.id,
          workspaceId,
        },
      );

    const recipient = await this.findConversationRecipientOrThrow({
      workspaceId,
      messageChannel,
      personId,
      callerAuthContext,
    });

    const startedConversation =
      await this.messagingProviderMessageSenderService.startConversationOrThrow(
        {
          conversationStarter,
          workspaceId,
          payload: {
            connectedAccountId,
            messageChannelId: messageChannel.id,
            text,
            idempotencyKey,
            recipients: [recipient],
          },
        },
      );

    const handle =
      startedConversation.recipients?.find(
        (startedRecipient) => startedRecipient.personId === personId,
      )?.handle ?? recipient.handle;

    if (!isNonEmptyString(handle)) {
      throw new MessagingProviderException(
        `startConversation logic function of messaging provider ${conversationStarter.messagingProvider.id} returned no handle for person ${personId}`,
        MessagingProviderExceptionCode.SEND_MESSAGE_FAILED,
      );
    }

    const delivery: AppMessageDelivery = {
      externalId: startedConversation.externalId,
      threadExternalId: startedConversation.threadExternalId,
      text,
      sentAt: startedConversation.sentAt ?? new Date().toISOString(),
      recipients: [
        {
          handle,
          displayName: recipient.displayName ?? undefined,
          personId,
        },
      ],
      subject: null,
      cc: [],
      bcc: [],
    };

    await this.cacheStorageService.set(
      deliveryKey,
      delivery,
      APP_MESSAGE_DELIVERY_TTL_MS,
    );

    return delivery;
  }

  private async findConversationRecipientOrThrow({
    workspaceId,
    messageChannel,
    personId,
    callerAuthContext,
  }: {
    workspaceId: string;
    messageChannel: Pick<MessageChannelEntity, 'id' | 'handle'>;
    personId: string;
    callerAuthContext: WorkspaceAuthContext;
  }): Promise<StartAppConversationRecipient> {
    const person = await this.findPersonReadableByCaller({
      personId,
      callerAuthContext,
    });

    if (!isDefined(person)) {
      throw new MessageChannelException(
        `Person ${personId} not found`,
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    const displayName = [person.name?.firstName, person.name?.lastName]
      .filter(isNonEmptyString)
      .join(' ');

    return {
      personId,
      displayName: isNonEmptyString(displayName) ? displayName : null,
      handle: await this.workspaceOrmManager.executeInWorkspaceContext(
        () => this.findKnownPersonHandle({ messageChannel, personId }),
        buildSystemAuthContext(workspaceId),
        { lite: true },
      ),
    };
  }

  private async findPersonReadableByCaller({
    personId,
    callerAuthContext,
  }: {
    personId: string;
    callerAuthContext: WorkspaceAuthContext;
  }): Promise<Pick<PersonWorkspaceEntity, 'id' | 'name'> | null> {
    try {
      return await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepository<PersonWorkspaceEntity>('person')
            .findOne({
              where: { id: personId },
              select: { id: true, name: true },
            }),
        callerAuthContext,
      );
    } catch (error) {
      if (error instanceof PermissionsException) {
        return null;
      }

      throw error;
    }
  }

  private async findKnownPersonHandle({
    messageChannel,
    personId,
  }: {
    messageChannel: Pick<MessageChannelEntity, 'id' | 'handle'>;
    personId: string;
  }): Promise<string | null> {
    const participant = await this.workspaceOrmManager
      .getRepositoryWithoutPermissionChecks<MessageParticipantWorkspaceEntity>(
        'messageParticipant',
      )
      .createQueryBuilder('messageParticipant')
      .select('messageParticipant.handle', 'handle')
      .innerJoin('messageParticipant.message', 'message')
      .innerJoin(
        'message.messageChannelMessageAssociations',
        'messageChannelMessageAssociation',
      )
      .where('messageParticipant.personId = :personId', { personId })
      .andWhere(
        'messageChannelMessageAssociation.messageChannelId = :messageChannelId',
        { messageChannelId: messageChannel.id },
      )
      .andWhere("messageParticipant.handle <> ''")
      .andWhere(
        'LOWER(messageParticipant.handle) <> LOWER(:messageChannelHandle)',
        { messageChannelHandle: messageChannel.handle },
      )
      .orderBy('messageParticipant.createdAt', 'DESC')
      .limit(1)
      .getRawOne<{ handle: string }>();

    return participant?.handle ?? null;
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
          const latestThreadMessages =
            await this.applicationThreadLatestMessagesService.find({
              messageChannelId: messageChannel.id,
              messageThreadId,
            });

          if (!isDefined(latestThreadMessages)) {
            return null;
          }

          const { threadExternalId, latestMessageIds } = latestThreadMessages;

          const participants = await this.workspaceOrmManager
            .getRepositoryWithoutPermissionChecks<MessageParticipantWorkspaceEntity>(
              'messageParticipant',
            )
            .find({
              where: { messageId: In(latestMessageIds) },
              select: {
                messageId: true,
                handle: true,
                displayName: true,
                personId: true,
                workspaceMemberId: true,
                role: true,
              },
            });

          const participantsByRecency = latestMessageIds.flatMap((messageId) =>
            participants.filter(
              (participant) => participant.messageId === messageId,
            ),
          );

          return {
            threadExternalId,
            recipients: await this.dropLinksToDeletedRecords(
              buildAppMessageReplyRecipients({
                participants: participantsByRecency,
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
