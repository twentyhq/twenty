import { Logger } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FileFolder } from 'twenty-shared/types';

import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { type FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { type FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import { MessageChannelException } from 'src/engine/metadata-modules/message-channel/message-channel.exception';
import { ApplicationMessageSendAttachmentsService } from 'src/engine/metadata-modules/message-channel/services/application-message-send-attachments.service';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const ATTACHMENTS = [
  { id: 'file-1', name: 'deck.pdf' },
  { id: 'file-2', name: 'photo.png' },
];

describe('ApplicationMessageSendAttachmentsService', () => {
  const isFeatureEnabled = jest.fn();
  const signFileByIdUrl = jest.fn();
  const copyFileIntoFilesField = jest.fn();
  const deleteFilesFieldFile = jest.fn();
  const findFiles = jest.fn();

  const service = new ApplicationMessageSendAttachmentsService(
    { isFeatureEnabled } as unknown as FeatureFlagService,
    { signFileByIdUrl } as unknown as FileUrlService,
    {
      copyFileIntoFilesField,
      deleteFilesFieldFile,
    } as unknown as FilesFieldService,
    { find: findFiles } as unknown as WorkspaceScopedRepository<FileEntity>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    isFeatureEnabled.mockResolvedValue(true);
    signFileByIdUrl.mockImplementation(
      async ({ fileId }: { fileId: string }) =>
        `https://twenty.example/file/email-attachment/${fileId}?token=signed`,
    );
  });

  describe('buildAttachmentsToSendOrThrow', () => {
    it('should describe each uploaded file with a signed download url', async () => {
      findFiles.mockResolvedValue([
        { id: 'file-2', mimeType: 'image/png', size: 2048 },
        { id: 'file-1', mimeType: 'application/pdf', size: 1024 },
      ]);

      await expect(
        service.buildAttachmentsToSendOrThrow({
          attachments: ATTACHMENTS,
          workspaceId: 'workspace-1',
        }),
      ).resolves.toEqual([
        {
          filename: 'deck.pdf',
          contentType: 'application/pdf',
          size: 1024,
          downloadUrl:
            'https://twenty.example/file/email-attachment/file-1?token=signed',
        },
        {
          filename: 'photo.png',
          contentType: 'image/png',
          size: 2048,
          downloadUrl:
            'https://twenty.example/file/email-attachment/file-2?token=signed',
        },
      ]);

      expect(signFileByIdUrl).toHaveBeenCalledWith({
        fileId: 'file-1',
        workspaceId: 'workspace-1',
        fileFolder: FileFolder.EmailAttachment,
      });
    });

    it('should send nothing without checking the feature flag when there are no attachments', async () => {
      await expect(
        service.buildAttachmentsToSendOrThrow({
          attachments: [],
          workspaceId: 'workspace-1',
        }),
      ).resolves.toEqual([]);

      expect(isFeatureEnabled).not.toHaveBeenCalled();
    });

    it('should refuse attachments when message attachments are disabled', async () => {
      isFeatureEnabled.mockResolvedValue(false);

      await expect(
        service.buildAttachmentsToSendOrThrow({
          attachments: ATTACHMENTS,
          workspaceId: 'workspace-1',
        }),
      ).rejects.toThrow(MessageChannelException);
      expect(findFiles).not.toHaveBeenCalled();
    });

    it('should refuse a file that is not a completed email attachment upload', async () => {
      findFiles.mockResolvedValue([
        { id: 'file-1', mimeType: 'application/pdf', size: 1024 },
      ]);

      await expect(
        service.buildAttachmentsToSendOrThrow({
          attachments: ATTACHMENTS,
          workspaceId: 'workspace-1',
        }),
      ).rejects.toThrow('Attachment file(s) not found: photo.png (file-2)');
      expect(signFileByIdUrl).not.toHaveBeenCalled();
    });
  });

  describe('copyIntoAttachmentFileFieldOrThrow', () => {
    it('should copy each file into the attachment file field', async () => {
      copyFileIntoFilesField
        .mockResolvedValueOnce({ id: 'copy-1' })
        .mockResolvedValueOnce({ id: 'copy-2' });

      await expect(
        service.copyIntoAttachmentFileFieldOrThrow({
          attachments: ATTACHMENTS,
          workspaceId: 'workspace-1',
        }),
      ).resolves.toEqual([
        { fileId: 'copy-1', label: 'deck.pdf' },
        { fileId: 'copy-2', label: 'photo.png' },
      ]);

      expect(copyFileIntoFilesField).toHaveBeenCalledWith({
        fileId: 'file-1',
        workspaceId: 'workspace-1',
        fieldMetadataUniversalIdentifier:
          STANDARD_OBJECTS.attachment.fields.file.universalIdentifier,
      });
    });

    it('should delete the successful copies and throw when a copy fails', async () => {
      copyFileIntoFilesField
        .mockResolvedValueOnce({ id: 'copy-1' })
        .mockRejectedValueOnce(new Error('Storage unavailable'));
      findFiles.mockResolvedValue([
        { id: 'copy-1', settings: { isTemporaryFile: true } },
      ]);

      await expect(
        service.copyIntoAttachmentFileFieldOrThrow({
          attachments: ATTACHMENTS,
          workspaceId: 'workspace-1',
        }),
      ).rejects.toThrow(/photo\.png \(Error: Storage unavailable\)/);

      expect(deleteFilesFieldFile).toHaveBeenCalledTimes(1);
      expect(deleteFilesFieldFile).toHaveBeenCalledWith({
        fileId: 'copy-1',
        workspaceId: 'workspace-1',
      });
    });
  });

  describe('deleteUnclaimedCopies', () => {
    it('should delete only the copies no attachment record claimed', async () => {
      findFiles.mockResolvedValue([
        { id: 'copy-1', settings: { isTemporaryFile: false } },
        { id: 'copy-2', settings: { isTemporaryFile: true } },
      ]);

      await service.deleteUnclaimedCopies({
        copiedAttachments: [
          { fileId: 'copy-1', label: 'deck.pdf' },
          { fileId: 'copy-2', label: 'photo.png' },
        ],
        workspaceId: 'workspace-1',
      });

      expect(deleteFilesFieldFile).toHaveBeenCalledTimes(1);
      expect(deleteFilesFieldFile).toHaveBeenCalledWith({
        fileId: 'copy-2',
        workspaceId: 'workspace-1',
      });
    });

    it('should warn about each copy it fails to delete without throwing', async () => {
      const warn = jest
        .spyOn(Logger.prototype, 'warn')
        .mockImplementation(() => undefined);

      findFiles.mockResolvedValue([
        { id: 'copy-1', settings: { isTemporaryFile: true } },
        { id: 'copy-2', settings: { isTemporaryFile: true } },
      ]);
      deleteFilesFieldFile
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Storage unavailable'));

      await expect(
        service.deleteUnclaimedCopies({
          copiedAttachments: [
            { fileId: 'copy-1', label: 'deck.pdf' },
            { fileId: 'copy-2', label: 'photo.png' },
          ],
          workspaceId: 'workspace-1',
        }),
      ).resolves.toBeUndefined();

      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('copy-2 in workspace workspace-1'),
      );

      warn.mockRestore();
    });

    it('should not throw when looking up the copies fails', async () => {
      findFiles.mockRejectedValue(new Error('Database unavailable'));

      await expect(
        service.deleteUnclaimedCopies({
          copiedAttachments: [{ fileId: 'copy-1', label: 'deck.pdf' }],
          workspaceId: 'workspace-1',
        }),
      ).resolves.toBeUndefined();

      expect(deleteFilesFieldFile).not.toHaveBeenCalled();
    });
  });
});
