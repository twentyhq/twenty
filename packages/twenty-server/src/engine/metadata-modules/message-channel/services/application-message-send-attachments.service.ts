import { Injectable, Logger } from '@nestjs/common';

import { type SendAppMessageAttachment } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey, FileFolder } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, Like } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { type AppMessageAttachmentInput } from 'src/engine/metadata-modules/message-channel/dtos/ingest-app-messages.input';
import { type SendAppChannelMessageAttachmentInput } from 'src/engine/metadata-modules/message-channel/dtos/send-app-channel-message.input';
import {
  MessageChannelException,
  MessageChannelExceptionCode,
} from 'src/engine/metadata-modules/message-channel/message-channel.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';

@Injectable()
export class ApplicationMessageSendAttachmentsService {
  private readonly logger = new Logger(
    ApplicationMessageSendAttachmentsService.name,
  );

  constructor(
    private readonly featureFlagService: FeatureFlagService,
    private readonly fileUrlService: FileUrlService,
    private readonly filesFieldService: FilesFieldService,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async buildAttachmentsToSendOrThrow({
    attachments,
    workspaceId,
  }: {
    attachments: SendAppChannelMessageAttachmentInput[];
    workspaceId: string;
  }): Promise<SendAppMessageAttachment[]> {
    if (!isNonEmptyArray(attachments)) {
      return [];
    }

    const isMessageAttachmentEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_MESSAGE_ATTACHMENT_ENABLED,
        workspaceId,
      );

    if (!isMessageAttachmentEnabled) {
      throw new MessageChannelException(
        'Message attachments are not enabled on this workspace',
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    const attachmentIds = attachments.map(({ id }) => id);

    if (new Set(attachmentIds).size !== attachmentIds.length) {
      throw new MessageChannelException(
        'The same attachment file cannot be sent more than once in a message',
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    const files = await this.fileRepository.find(workspaceId, {
      where: {
        id: In(attachmentIds),
        path: Like(`${FileFolder.EmailAttachment}/%`),
        status: FILE_STATUS.UPLOADED,
      },
      select: { id: true, mimeType: true, size: true },
    });
    const fileById = new Map(files.map((file) => [file.id, file]));

    const missingAttachments = attachments.filter(
      ({ id }) => !fileById.has(id),
    );

    if (isNonEmptyArray(missingAttachments)) {
      throw new MessageChannelException(
        `Attachment file(s) not found: ${missingAttachments.map(({ name, id }) => `${name} (${id})`).join(', ')}`,
        MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT,
      );
    }

    return Promise.all(
      attachments.flatMap(({ id, name }) => {
        const file = fileById.get(id);

        if (!isDefined(file)) {
          return [];
        }

        return [
          this.fileUrlService
            .signFileByIdUrl({
              fileId: id,
              workspaceId,
              fileFolder: FileFolder.EmailAttachment,
            })
            .then((downloadUrl) => ({
              filename: name,
              contentType: file.mimeType,
              size: file.size,
              downloadUrl,
            })),
        ];
      }),
    );
  }

  async copyIntoAttachmentFileFieldOrThrow({
    attachments,
    workspaceId,
  }: {
    attachments: SendAppChannelMessageAttachmentInput[];
    workspaceId: string;
  }): Promise<AppMessageAttachmentInput[]> {
    const copyResults = await Promise.allSettled(
      attachments.map(async ({ id, name }) => {
        const copiedFile = await this.filesFieldService.copyFileIntoFilesField({
          fileId: id,
          workspaceId,
          fieldMetadataUniversalIdentifier:
            STANDARD_OBJECTS.attachment.fields.file.universalIdentifier,
          shouldAssertStorageStock: false,
        });

        return { fileId: copiedFile.id, label: name };
      }),
    );

    const copiedAttachments = copyResults.flatMap((copyResult) =>
      copyResult.status === 'fulfilled' ? [copyResult.value] : [],
    );

    const copyFailures = copyResults.flatMap((copyResult, index) =>
      copyResult.status === 'rejected'
        ? [`${attachments[index].name} (${copyResult.reason})`]
        : [],
    );

    if (isNonEmptyArray(copyFailures)) {
      await this.deleteCopiedFiles({
        fileIds: copiedAttachments.map(({ fileId }) => fileId),
        workspaceId,
      });

      throw new MessageChannelException(
        `Failed to store sent app message attachment(s) in workspace ${workspaceId}: ${copyFailures.join(', ')}`,
        MessageChannelExceptionCode.MESSAGE_ATTACHMENT_STORAGE_FAILED,
      );
    }

    return copiedAttachments;
  }

  async deleteUnreferencedCopies({
    copiedAttachments,
    workspaceId,
  }: {
    copiedAttachments: AppMessageAttachmentInput[];
    workspaceId: string;
  }): Promise<void> {
    if (copiedAttachments.length === 0) {
      return;
    }

    try {
      const copiedFileIds = copiedAttachments.map(({ fileId }) => fileId);

      const referencedFileIds = await this.findFileIdsReferencedByAttachments({
        fileIds: copiedFileIds,
        workspaceId,
      });

      await this.deleteCopiedFiles({
        fileIds: copiedFileIds.filter(
          (fileId) => !referencedFileIds.has(fileId),
        ),
        workspaceId,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to clean up sent app message attachment copies in workspace ${workspaceId}: ${error}`,
      );
    }
  }

  // a rolled back ingestion can leave a copy claimed but unreferenced, so only attachment rows prove a copy is in use
  private async findFileIdsReferencedByAttachments({
    fileIds,
    workspaceId,
  }: {
    fileIds: string[];
    workspaceId: string;
  }): Promise<Set<string>> {
    const attachments: Pick<AttachmentWorkspaceEntity, 'file'>[] =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepositoryWithoutPermissionChecks<AttachmentWorkspaceEntity>(
              'attachment',
            )
            .createQueryBuilder('attachment')
            .where(
              `EXISTS (SELECT 1 FROM jsonb_array_elements(CASE WHEN jsonb_typeof("attachment"."file") = 'array' THEN "attachment"."file" ELSE '[]'::jsonb END) AS "attachedFile"("value") WHERE "attachedFile"."value" ->> 'fileId' = ANY(:fileIds))`,
              { fileIds },
            )
            .getMany(),
        buildSystemAuthContext(workspaceId),
        { lite: true },
      );

    return new Set(
      attachments.flatMap((attachment) =>
        (attachment.file ?? []).map(({ fileId }) => fileId),
      ),
    );
  }

  private async deleteCopiedFiles({
    fileIds,
    workspaceId,
  }: {
    fileIds: string[];
    workspaceId: string;
  }): Promise<void> {
    const deletionResults = await Promise.allSettled(
      fileIds.map((fileId) =>
        this.filesFieldService.deleteFilesFieldFile({ fileId, workspaceId }),
      ),
    );

    deletionResults.forEach((deletionResult, index) => {
      if (deletionResult.status === 'rejected') {
        this.logger.warn(
          `Failed to delete sent app message attachment copy ${fileIds[index]} in workspace ${workspaceId}: ${deletionResult.reason}`,
        );
      }
    });
  }
}
