import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type AppMessageInput } from 'src/engine/metadata-modules/message-channel/dtos/ingest-app-messages.input';
import { type IngestAppMessagesOutput } from 'src/engine/metadata-modules/message-channel/dtos/ingest-app-messages.output';
import {
  MessageChannelException,
  MessageChannelExceptionCode,
} from 'src/engine/metadata-modules/message-channel/message-channel.exception';
import { ApplicationMessageChannelsService } from 'src/engine/metadata-modules/message-channel/services/application-message-channels.service';
import { buildAppIngestionLockKey } from 'src/engine/metadata-modules/message-channel/utils/build-app-ingestion-lock-key.util';
import { buildAppMessageHeaderMessageId } from 'src/engine/metadata-modules/message-channel/utils/build-app-message-header-message-id.util';
import { resolveAppMessageDirection } from 'src/engine/metadata-modules/message-channel/utils/resolve-app-message-direction.util';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

// A full batch is 100 messages in one transaction, so the hold has to outlast
// that comfortably: a lease that expires mid-save would let the next delivery
// in and reintroduce exactly the duplicate this prevents. Waiting up to the
// same order of time is better than failing a webhook that would have
// succeeded a second later.
const INGESTION_LOCK_OPTIONS = {
  ttl: 60_000,
  maxRetries: 120,
  ms: 500,
};

type IngestArgs = {
  applicationId: string;
  workspaceId: string;
  // Ingestion resolves the channel through the same gate the channel API
  // uses, so a run triggered by one member cannot write into another
  // member's private channel.
  requestUserWorkspaceId: string | null;
  messageChannelId: string;
  messages: AppMessageInput[];
};

@Injectable()
export class ApplicationMessageIngestionService {
  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly applicationMessageChannelsService: ApplicationMessageChannelsService,
    private readonly saveMessagesService: MessagingSaveMessagesAndEnqueueContactCreationService,
    private readonly cacheLockService: CacheLockService,
  ) {}

  async ingest({
    applicationId,
    workspaceId,
    requestUserWorkspaceId,
    messageChannelId,
    messages,
  }: IngestArgs): Promise<IngestAppMessagesOutput> {
    const messageChannel =
      await this.applicationMessageChannelsService.findOwnedOrThrow({
        applicationId,
        workspaceId,
        requestUserWorkspaceId,
        id: messageChannelId,
      });

    if (!messageChannel.isSyncEnabled) {
      throw new MessageChannelException(
        `Message channel ${messageChannelId} has sync disabled`,
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    this.assertEachMessageHasOneSender(messages);
    this.assertExternalIdsAreUnique(messages);

    const connectedAccount =
      await this.connectedAccountRepository.findOneOrFail({
        where: { id: messageChannel.connectedAccountId, workspaceId },
      });

    const messagesToSave = messages.map((message) =>
      this.toMessageWithParticipants({
        message,
        applicationId,
        messageChannel,
      }),
    );

    // The save path decides what to insert by reading first and writing after,
    // and no unique index backs headerMessageId — so two deliveries of the same
    // provider message, arriving together, would both see nothing and both
    // insert, handing the app two different Twenty ids for one message. A
    // provider redelivers constantly, so this is the common case, not the edge.
    // Serialising per channel is the narrowest scope that closes it: dedup
    // never spans channels, and one channel's deliveries are naturally
    // sequential, so contention is a redelivery racing its original.
    const savedMessages = await this.cacheLockService.withLock(
      () =>
        this.saveMessagesService.saveMessagesAndEnqueueContactCreation(
          messagesToSave,
          // The save path only reads folder and contact-creation settings off
          // the channel, both inert here, plus its id.
          messageChannel,
          connectedAccount,
          workspaceId,
        ),
      buildAppIngestionLockKey({ workspaceId, messageChannelId }),
      INGESTION_LOCK_OPTIONS,
    );

    if (!isDefined(savedMessages)) {
      throw new MessageChannelException(
        `Ingestion into message channel ${messageChannelId} did not persist`,
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    const {
      messageExternalIdsAndIdsMap,
      messageExternalIdToMessageThreadIdMap,
    } = savedMessages;

    // Dropping a row here would report success while returning fewer messages
    // than were sent, leaving the app with nothing to retry against — the
    // silent version of the "did not persist" failure above.
    return {
      messages: messagesToSave.map((message) => {
        const messageId = messageExternalIdsAndIdsMap.get(message.externalId);
        const messageThreadId = messageExternalIdToMessageThreadIdMap.get(
          message.externalId,
        );

        if (!isDefined(messageId) || !isDefined(messageThreadId)) {
          throw new MessageChannelException(
            `Message ${message.externalId} was not persisted by the save path`,
            MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
          );
        }

        return {
          externalId: message.externalId,
          messageId,
          messageThreadId,
        };
      }),
    };
  }

  private toMessageWithParticipants({
    message,
    applicationId,
    messageChannel,
  }: {
    message: AppMessageInput;
    applicationId: string;
    messageChannel: MessageChannelEntity;
  }): MessageWithParticipants {
    return {
      headerMessageId: buildAppMessageHeaderMessageId({
        applicationId,
        messageChannelId: messageChannel.id,
        externalId: message.externalId,
      }),
      subject: message.subject ?? null,
      text: message.text,
      receivedAt: message.receivedAt,
      // Apps ingest what the provider already delivered; there is no
      // provider-side draft to mirror.
      isDraft: false,
      externalId: message.externalId,
      messageThreadExternalId: message.threadExternalId,
      direction: resolveAppMessageDirection({
        participants: message.participants,
        channelHandle: messageChannel.handle,
      }),
      attachments: [],
      participants: message.participants.map((participant) => ({
        role: participant.role,
        handle: participant.handle,
        displayName: participant.displayName ?? '',
      })),
    };
  }

  // Direction, the thread's sender column and the timeline preview all read
  // the FROM participant, so a message without exactly one is rejected rather
  // than silently rendering as an empty conversation.
  private assertEachMessageHasOneSender(messages: AppMessageInput[]): void {
    for (const message of messages) {
      const senderCount = message.participants.filter(
        (participant) => participant.role === MessageParticipantRole.FROM,
      ).length;

      if (senderCount !== 1) {
        throw new MessageChannelException(
          `Message ${message.externalId} must have exactly one FROM participant, got ${senderCount}`,
          MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
        );
      }
    }
  }

  // Two entries sharing an externalId would race each other inside the save
  // transaction, which keys its accumulator on exactly that value.
  private assertExternalIdsAreUnique(messages: AppMessageInput[]): void {
    const externalIds = new Set<string>();

    for (const message of messages) {
      if (externalIds.has(message.externalId)) {
        throw new MessageChannelException(
          `Message externalId ${message.externalId} appears more than once in the same batch`,
          MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
        );
      }

      externalIds.add(message.externalId);
    }
  }
}
