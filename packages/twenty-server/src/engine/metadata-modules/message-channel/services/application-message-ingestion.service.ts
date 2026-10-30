import { Injectable } from '@nestjs/common';

import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { APP_INGESTION_LOCK_OPTIONS } from 'src/engine/metadata-modules/message-channel/constants/app-ingestion-lock-options.constant';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
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
import { withCanonicalParticipantHandlesOrThrow } from 'src/engine/metadata-modules/message-channel/utils/with-canonical-participant-handles-or-throw.util';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { PersonHandleFieldService } from 'src/modules/match-participant/person-handle-field/person-handle-field.service';
import { type PersonHandleField } from 'src/modules/match-participant/person-handle-field/types/person-handle-field.type';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message.type';

type IngestArgs = {
  applicationId: string;
  workspaceId: string;
  // same gate as the channel API so one member's run cannot write into another's private channel
  requestUserWorkspaceId: string | null;
  messageChannelId: string;
  messages: AppMessageInput[];
};

@Injectable()
export class ApplicationMessageIngestionService {
  constructor(
    private readonly applicationMessageChannelsService: ApplicationMessageChannelsService,
    private readonly saveMessagesService: MessagingSaveMessagesAndEnqueueContactCreationService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly cacheLockService: CacheLockService,
    private readonly personHandleFieldService: PersonHandleFieldService,
    @InjectWorkspaceScopedRepository(MessageFolderEntity)
    private readonly messageFolderRepository: WorkspaceScopedRepository<MessageFolderEntity>,
  ) {}

  async ingest({
    applicationId,
    workspaceId,
    requestUserWorkspaceId,
    messageChannelId,
    messages,
  }: IngestArgs): Promise<IngestAppMessagesOutput> {
    const { messageChannel, connectedAccount } =
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

    const personHandleField = await this.findPersonHandleFieldOrThrow({
      workspaceId,
      participantHandleFieldUniversalIdentifier:
        messageChannel.participantHandleFieldUniversalIdentifier,
    });

    const messagesToSave = messages.map((message) =>
      this.toMessageWithParticipants({
        message: isDefined(personHandleField)
          ? withCanonicalParticipantHandlesOrThrow({
              message,
              personHandleField,
            })
          : message,
        applicationId,
        messageChannel,
      }),
    );

    // save reads before writing and headerMessageId has no unique index, so concurrent redeliveries would duplicate
    // locked per channel, the narrowest scope since dedup never spans channels
    const savedMessages = await this.cacheLockService.withLock(
      async () =>
        this.saveMessagesService.saveMessagesAndEnqueueContactCreation({
          messagesToSave: await this.withMessageFolderIdsOrThrow({
            workspaceId,
            messageChannelId,
            messages: messagesToSave,
          }),
          // the save path only reads inert settings and the id off the channel
          messageChannel,
          connectedAccount,
          workspaceId,
          personHandleField: personHandleField ?? undefined,
        }),
      buildAppIngestionLockKey({ workspaceId, messageChannelId }),
      APP_INGESTION_LOCK_OPTIONS,
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

    // never drop a row: the app would see success with nothing to retry
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
      isDraft: false,
      externalId: message.externalId,
      messageThreadExternalId: message.threadExternalId,
      messageFolderExternalIds: [...new Set(message.folderExternalIds ?? [])],
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

  private async withMessageFolderIdsOrThrow({
    workspaceId,
    messageChannelId,
    messages,
  }: {
    workspaceId: string;
    messageChannelId: string;
    messages: MessageWithParticipants[];
  }): Promise<MessageWithParticipants[]> {
    const folderExternalIds = [
      ...new Set(
        messages.flatMap((message) => message.messageFolderExternalIds ?? []),
      ),
    ];

    if (folderExternalIds.length === 0) {
      return messages;
    }

    const messageFolders = await this.messageFolderRepository.find(
      workspaceId,
      {
        where: { messageChannelId, externalId: In(folderExternalIds) },
        select: { id: true, externalId: true },
      },
    );

    const messageFolderIdByExternalId = new Map(
      messageFolders.map((messageFolder) => [
        messageFolder.externalId,
        messageFolder.id,
      ]),
    );

    const unknownFolderExternalIds = folderExternalIds.filter(
      (folderExternalId) => !messageFolderIdByExternalId.has(folderExternalId),
    );

    if (unknownFolderExternalIds.length > 0) {
      throw new MessageChannelException(
        `Unknown folder externalId(s) on message channel ${messageChannelId}: ${unknownFolderExternalIds.join(', ')}. Declare them with syncAppMessageFolders first`,
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    return messages.map((message) => ({
      ...message,
      messageFolderIds: (message.messageFolderExternalIds ?? [])
        .map((folderExternalId) =>
          messageFolderIdByExternalId.get(folderExternalId),
        )
        .filter(isDefined),
    }));
  }

  // raw handles would mix with the canonical ones already stored and stop matching the channel's own handle
  private async findPersonHandleFieldOrThrow({
    workspaceId,
    participantHandleFieldUniversalIdentifier,
  }: {
    workspaceId: string;
    participantHandleFieldUniversalIdentifier: string | null;
  }): Promise<PersonHandleField | null> {
    if (!isDefined(participantHandleFieldUniversalIdentifier)) {
      return null;
    }

    const personHandleField =
      await this.personHandleFieldService.findByUniversalIdentifier({
        workspaceId,
        fieldUniversalIdentifier: participantHandleFieldUniversalIdentifier,
      });

    if (!isDefined(personHandleField)) {
      throw new MessageChannelException(
        `The person field ${participantHandleFieldUniversalIdentifier} this channel matches participants on no longer exists or is inactive`,
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    return personHandleField;
  }

  // checked up front so the app gets an error rather than a dangling link that never renders
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

  // direction, thread sender and timeline preview all read the single FROM participant
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

  // the save transaction keys its accumulator on externalId
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
