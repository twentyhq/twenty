import { Injectable } from '@nestjs/common';
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

    const messageToSave = formatSentMessage(
      input,
      await this.uploadAttachmentFiles(input),
    );

    const savedMessagesResult =
      await this.saveMessagesAndEnqueueContactCreationService.saveMessagesAndEnqueueContactCreation(
        {
          messagesToSave: [messageToSave],
          messageChannel,
          connectedAccount: messageChannel.connectedAccount,
          workspaceId: input.workspaceId,
        },
      );

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

    return Promise.all(
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
  }
}
