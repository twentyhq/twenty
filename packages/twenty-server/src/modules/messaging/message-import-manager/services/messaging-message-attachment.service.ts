import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import {
  MessageChannelException,
  MessageChannelExceptionCode,
} from 'src/engine/metadata-modules/message-channel/message-channel.exception';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { type MessageAttachmentFile } from 'src/modules/messaging/message-import-manager/types/message.type';

const ATTACHMENT_FILE_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.attachment.fields.file.universalIdentifier;

@Injectable()
export class MessagingMessageAttachmentService {
  constructor(
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async saveMessageAttachments({
    messageAttachmentFiles,
    workspaceId,
    transactionScope,
  }: {
    messageAttachmentFiles: {
      messageId: string;
      attachmentFiles: MessageAttachmentFile[];
    }[];
    workspaceId: string;
    transactionScope: WorkspaceTransactionScope;
  }): Promise<void> {
    if (messageAttachmentFiles.length === 0) {
      return;
    }

    const isMessageAttachmentEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_MESSAGE_ATTACHMENT_ENABLED,
        workspaceId,
      );

    // rejecting lets the app retry instead of losing the files
    if (!isMessageAttachmentEnabled) {
      throw new MessageChannelException(
        'Message attachments are unavailable until this workspace finishes upgrading',
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    const attachmentRepository =
      transactionScope.getRepositoryWithoutPermissionChecks<AttachmentWorkspaceEntity>(
        'attachment',
      );

    const storedAttachments = await attachmentRepository.find({
      where: {
        targetMessageId: In(
          messageAttachmentFiles.map(({ messageId }) => messageId),
        ),
      },
      select: { targetMessageId: true },
    });

    const messageIdsWithAttachments = new Set(
      storedAttachments
        .map(({ targetMessageId }) => targetMessageId)
        .filter(isDefined),
    );

    const attachmentsToCreate = messageAttachmentFiles.flatMap(
      ({ messageId, attachmentFiles }) =>
        messageIdsWithAttachments.has(messageId)
          ? []
          : attachmentFiles.map(({ fileId, label }) => ({
              name: label,
              file: [{ fileId, label }],
              targetMessageId: messageId,
            })),
    );

    if (attachmentsToCreate.length === 0) {
      return;
    }

    await this.assertFilesAreAttachableOrThrow({
      workspaceId,
      fileIds: attachmentsToCreate.flatMap(({ file }) =>
        file.map(({ fileId }) => fileId),
      ),
    });

    await attachmentRepository.insert(attachmentsToCreate);
  }

  private async assertFilesAreAttachableOrThrow({
    workspaceId,
    fileIds,
  }: {
    workspaceId: string;
    fileIds: string[];
  }): Promise<void> {
    const repeatedFileIds = fileIds.filter(
      (fileId, index) => fileIds.indexOf(fileId) !== index,
    );

    if (repeatedFileIds.length > 0) {
      throw new MessageChannelException(
        `File(s) attached to more than one message in the same batch: ${[...new Set(repeatedFileIds)].join(', ')}`,
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    const files = await this.fileRepository.find(workspaceId, {
      where: { id: In(fileIds) },
      select: { id: true, path: true, status: true, settings: true },
    });
    const fileById = new Map(files.map((file) => [file.id, file]));

    const unattachableFileIds = fileIds.filter((fileId) => {
      const file = fileById.get(fileId);

      return (
        !isDefined(file) ||
        file.status !== FILE_STATUS.UPLOADED ||
        !file.settings?.isTemporaryFile ||
        !file.path.includes(ATTACHMENT_FILE_FIELD_UNIVERSAL_IDENTIFIER)
      );
    });

    if (unattachableFileIds.length > 0) {
      throw new MessageChannelException(
        `File(s) ${unattachableFileIds.join(', ')} cannot be attached: each must be a completed upload into the attachment file field that no record holds yet`,
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }
  }
}
