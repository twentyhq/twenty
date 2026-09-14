import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type AppMessageInput } from 'src/engine/metadata-modules/message-channel/dtos/ingest-app-messages.input';
import { type IngestAppMessagesOutput } from 'src/engine/metadata-modules/message-channel/dtos/ingest-app-messages.output';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import {
  MessageChannelException,
  MessageChannelExceptionCode,
} from 'src/engine/metadata-modules/message-channel/message-channel.exception';
import { ApplicationMessageChannelsService } from 'src/engine/metadata-modules/message-channel/services/application-message-channels.service';
import { buildAppMessageHeaderMessageId } from 'src/engine/metadata-modules/message-channel/utils/build-app-message-header-message-id.util';
import { resolveAppMessageDirection } from 'src/engine/metadata-modules/message-channel/utils/resolve-app-message-direction.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

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
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly applicationMessageChannelsService: ApplicationMessageChannelsService,
    private readonly saveMessagesService: MessagingSaveMessagesAndEnqueueContactCreationService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
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
    await this.assertReferencedIdentitiesExist({ messages, workspaceId });

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

    const savedMessages =
      await this.saveMessagesService.saveMessagesAndEnqueueContactCreation(
        messagesToSave,
        // The save path only reads folder and contact-creation settings off
        // the channel, both inert here, plus its id.
        messageChannel,
        connectedAccount,
        workspaceId,
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

    return {
      messages: messagesToSave.flatMap((message) => {
        const messageId = messageExternalIdsAndIdsMap.get(message.externalId);
        const messageThreadId = messageExternalIdToMessageThreadIdMap.get(
          message.externalId,
        );

        if (!isDefined(messageId) || !isDefined(messageThreadId)) {
          return [];
        }

        return [
          {
            externalId: message.externalId,
            messageId,
            messageThreadId,
          },
        ];
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
        personId: participant.personId ?? null,
        workspaceMemberId: participant.workspaceMemberId ?? null,
      })),
    };
  }

  // A participant pointing at a record that is not there, or belongs to
  // another workspace, would insert a dangling link that quietly never
  // renders. Checked up front so the app gets told, rather than at the FK.
  private async assertReferencedIdentitiesExist({
    messages,
    workspaceId,
  }: {
    messages: AppMessageInput[];
    workspaceId: string;
  }): Promise<void> {
    const personIds = new Set<string>();
    const workspaceMemberIds = new Set<string>();

    for (const message of messages) {
      for (const participant of message.participants) {
        if (isDefined(participant.personId)) {
          personIds.add(participant.personId);
        }

        if (isDefined(participant.workspaceMemberId)) {
          workspaceMemberIds.add(participant.workspaceMemberId);
        }
      }
    }

    if (personIds.size === 0 && workspaceMemberIds.size === 0) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        await this.assertRecordsExist({
          objectMetadataName: 'person',
          ids: personIds,
        });
        await this.assertRecordsExist({
          objectMetadataName: 'workspaceMember',
          ids: workspaceMemberIds,
        });
      },
      authContext,
      { lite: true },
    );
  }

  private async assertRecordsExist({
    objectMetadataName,
    ids,
  }: {
    objectMetadataName: 'person' | 'workspaceMember';
    ids: Set<string>;
  }): Promise<void> {
    if (ids.size === 0) {
      return;
    }

    const repository = this.workspaceOrmManager.getRepository(
      objectMetadataName,
      { shouldBypassPermissionChecks: true },
    );

    const found = await repository.find({
      where: { id: In([...ids]) },
      select: { id: true },
    });
    const foundIds = new Set(found.map((record) => record.id));
    const missingIds = [...ids].filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new MessageChannelException(
        `Unknown ${objectMetadataName} id(s) on ingested participants: ${missingIds.join(', ')}`,
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }
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
