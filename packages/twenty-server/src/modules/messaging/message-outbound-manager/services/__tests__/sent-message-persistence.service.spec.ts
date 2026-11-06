import { type Repository } from 'typeorm';

import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';
import { SentMessagePersistenceService } from 'src/modules/messaging/message-outbound-manager/services/sent-message-persistence.service';
import { type PersistSentMessageInput } from 'src/modules/messaging/message-outbound-manager/types/persist-sent-message-input.type';

const buildInput = (
  overrides: Partial<PersistSentMessageInput> = {},
): PersistSentMessageInput => ({
  sendResult: {
    headerMessageId: '<msg-1@mail.example>',
    messageExternalId: 'external-1',
    threadExternalId: 'thread-external-1',
  },
  subject: 'Quarterly review',
  body: 'See attached.',
  recipients: { to: ['alice@example.com'], cc: [], bcc: [] },
  connectedAccount: {
    id: 'connected-account-1',
    handle: 'sender@example.com',
  } as ConnectedAccountEntity,
  messageChannelId: 'channel-1',
  workspaceId: 'workspace-1',
  attachments: [
    {
      filename: 'report.pdf',
      content: Buffer.from('report'),
      contentType: 'application/pdf',
    },
    {
      filename: 'too-big.zip',
      content: Buffer.from('zip'),
      contentType: 'application/zip',
    },
  ],
  ...overrides,
});

describe('SentMessagePersistenceService', () => {
  const saveMessagesAndEnqueueContactCreation = jest.fn();
  const uploadFile = jest.fn();
  const isFeatureEnabled = jest.fn();

  const service = new SentMessagePersistenceService(
    {
      findOneOrFail: jest.fn().mockResolvedValue({ connectedAccount: {} }),
    } as unknown as Repository<MessageChannelEntity>,
    {
      saveMessagesAndEnqueueContactCreation,
    } as unknown as MessagingSaveMessagesAndEnqueueContactCreationService,
    { uploadFile } as unknown as FilesFieldService,
    { isFeatureEnabled } as unknown as FeatureFlagService,
  );

  const getSavedMessage = () =>
    saveMessagesAndEnqueueContactCreation.mock.calls[0][0].messagesToSave[0];

  beforeEach(() => {
    jest.clearAllMocks();
    saveMessagesAndEnqueueContactCreation.mockResolvedValue(undefined);
    isFeatureEnabled.mockResolvedValue(true);
  });

  it('should save uploaded attachments as message attachment files', async () => {
    uploadFile
      .mockResolvedValueOnce({ id: 'file-1' })
      .mockResolvedValueOnce({ id: 'file-2' });

    await service.persistSentMessage(buildInput());

    expect(getSavedMessage().attachmentFiles).toEqual([
      { fileId: 'file-1', label: 'report.pdf' },
      { fileId: 'file-2', label: 'too-big.zip' },
    ]);
  });

  it('should still save the sent message when an attachment upload fails', async () => {
    uploadFile
      .mockResolvedValueOnce({ id: 'file-1' })
      .mockRejectedValueOnce(new Error('Storage quota exceeded'));

    await service.persistSentMessage(buildInput());

    expect(getSavedMessage().attachmentFiles).toEqual([
      { fileId: 'file-1', label: 'report.pdf' },
    ]);
  });

  it('should not store attachments when message attachments are disabled', async () => {
    isFeatureEnabled.mockResolvedValue(false);

    await service.persistSentMessage(buildInput());

    expect(uploadFile).not.toHaveBeenCalled();
    expect(getSavedMessage().attachmentFiles).toEqual([]);
  });
});
