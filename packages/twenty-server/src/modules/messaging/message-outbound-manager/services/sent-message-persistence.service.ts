import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import {
  type MessageAttachmentFile,
  type MessageWithParticipants,
} from 'src/modules/messaging/message-import-manager/types/message.type';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';
import { type PersistSentMessageInput } from 'src/modules/messaging/message-outbound-manager/types/persist-sent-message-input.type';
import { type PersistedSentMessage } from 'src/modules/messaging/message-outbound-manager/types/persisted-sent-message.type';
import { formatSentMessage } from 'src/modules/messaging/message-outbound-manager/utils/format-sent-message.util';

@Injectable()
export class SentMessagePersistenceService {
  private readonly logger = new Logger(SentMessagePersistenceService.name);

  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly saveMessagesAndEnqueueContactCreationService: MessagingSaveMessagesAndEnqueueContactCreationService,
    private readonly filesFieldService: FilesFieldService,
    private readonly featureFlagService: FeatureFlagService,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
  ) {}

  async persistSentMessage(
    input: PersistSentMessageInput,
  ): Promise<PersistedSentMessage | undefined> {
    const messageChannel = await this.messageChannelRepository.findOneOrFail({
      where: {
        id: input.messageChannelId,
        workspaceId: input.workspaceId,
      },
      relations: { connectedAccount: true },
    });

    const attachmentFiles = await this.uploadAttachmentFiles(input);
    const messageToSave = formatSentMessage({ input, attachmentFiles });

    const savedMessagesResult = await this.saveMessageAndCleanUpAttachments({
      messageToSave,
      messageChannel,
      attachmentFiles,
      workspaceId: input.workspaceId,
    });

    const messageId = savedMessagesResult?.messageExternalIdsAndIdsMap.get(
      messageToSave.externalId,
    );
    const messageThreadId =
      savedMessagesResult?.messageExternalIdToMessageThreadIdMap.get(
        messageToSave.externalId,
      );

    if (!isDefined(messageId) || !isDefined(messageThreadId)) {
      return undefined;
    }

    return { messageId, messageThreadId };
  }

  private async saveMessageAndCleanUpAttachments({
    messageToSave,
    messageChannel,
    attachmentFiles,
    workspaceId,
  }: {
    messageToSave: MessageWithParticipants;
    messageChannel: MessageChannelEntity;
    attachmentFiles: MessageAttachmentFile[];
    workspaceId: string;
  }) {
    try {
      return await this.saveMessagesAndEnqueueContactCreationService.saveMessagesAndEnqueueContactCreation(
        {
          messagesToSave: [messageToSave],
          messageChannel,
          connectedAccount: messageChannel.connectedAccount,
          workspaceId,
          folderLinkUpdate: 'add',
        },
      );
    } finally {
      await this.deleteUnclaimedAttachmentFiles({
        attachmentFiles,
        workspaceId,
      });
    }
  }

  private async uploadAttachmentFiles({
    attachments,
    workspaceId,
  }: Pick<PersistSentMessageInput, 'attachments' | 'workspaceId'>): Promise<
    MessageAttachmentFile[]
  > {
    if (!isNonEmptyArray(attachments)) {
      return [];
    }

    const isMessageAttachmentEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_MESSAGE_ATTACHMENT_ENABLED,
        workspaceId,
      );

    if (!isMessageAttachmentEnabled) {
      return [];
    }

    const uploadResults = await Promise.allSettled(
      attachments.map(async ({ filename, content }) => {
        const uploadedFile = await this.filesFieldService.uploadFile({
          file: content,
          filename,
          workspaceId,
          fieldMetadataUniversalIdentifier:
            STANDARD_OBJECTS.attachment.fields.file.universalIdentifier,
        });

        return { fileId: uploadedFile.id, label: filename };
      }),
    );

    return uploadResults.flatMap((uploadResult, index) => {
      if (uploadResult.status === 'fulfilled') {
        return [uploadResult.value];
      }

      this.logger.warn(
        `Failed to store sent message attachment "${attachments[index].filename}" in workspace ${workspaceId}: ${uploadResult.reason}`,
      );

      return [];
    });
  }

  // Unclaimed copies have no expiry, so cleanup crons never collect them
  private async deleteUnclaimedAttachmentFiles({
    attachmentFiles,
    workspaceId,
  }: {
    attachmentFiles: MessageAttachmentFile[];
    workspaceId: string;
  }): Promise<void> {
    if (attachmentFiles.length === 0) {
      return;
    }

    const files = await this.fileRepository.find(workspaceId, {
      where: { id: In(attachmentFiles.map(({ fileId }) => fileId)) },
      select: { id: true, settings: true },
    });

    await Promise.allSettled(
      files
        .filter((file) => file.settings?.isTemporaryFile)
        .map((file) =>
          this.filesFieldService.deleteFilesFieldFile({
            fileId: file.id,
            workspaceId,
          }),
        ),
    );
  }
}
