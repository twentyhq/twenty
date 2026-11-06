import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type MessageAttachmentFile } from 'src/modules/messaging/message-import-manager/types/message.type';
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
    const messageToSave = formatSentMessage(input, attachmentFiles);

    const savedMessagesResult =
      await this.saveMessagesAndEnqueueContactCreationService
        .saveMessagesAndEnqueueContactCreation({
          messagesToSave: [messageToSave],
          messageChannel,
          connectedAccount: messageChannel.connectedAccount,
          workspaceId: input.workspaceId,
        })
        .catch(async (saveError) => {
          await this.deleteAttachmentFiles(attachmentFiles, input.workspaceId);

          throw saveError;
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

  private async uploadAttachmentFiles({
    attachments,
    workspaceId,
  }: PersistSentMessageInput): Promise<MessageAttachmentFile[]> {
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

    return uploadResults.flatMap((uploadResult) => {
      if (uploadResult.status === 'fulfilled') {
        return [uploadResult.value];
      }

      this.logger.warn(
        `Failed to store sent message attachment: ${uploadResult.reason}`,
      );

      return [];
    });
  }

  // Uploaded copies are temporary files without an expiry, so cleanup crons never collect them
  private async deleteAttachmentFiles(
    attachmentFiles: MessageAttachmentFile[],
    workspaceId: string,
  ): Promise<void> {
    await Promise.allSettled(
      attachmentFiles.map(({ fileId }) =>
        this.filesFieldService.deleteFilesFieldFile({ fileId, workspaceId }),
      ),
    );
  }
}
