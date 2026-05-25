import { Test, type TestingModule } from '@nestjs/testing';

import { google } from 'googleapis';
import { MessageFolderImportPolicy } from 'twenty-shared/types';

import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import {
  createMockMessageFolder,
  createRawGmailMessage,
  mockConnectedAccount,
} from 'src/modules/messaging/message-import-manager/drivers/gmail/services/__mocks__/gmail-get-messages.mocks';
import { GmailGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-messages.service';
import { GmailMessagesImportErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-messages-import-error-handler.service';

describe('GmailGetMessagesService', () => {
  let service: GmailGetMessagesService;
  let errorHandler: GmailMessagesImportErrorHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GmailGetMessagesService,
        {
          provide: GoogleOAuth2ClientProvider,
          useValue: { getClient: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: GmailMessagesImportErrorHandler,
          useValue: { handleError: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(GmailGetMessagesService);
    errorHandler = module.get(GmailMessagesImportErrorHandler);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const threadsGet = jest.fn();

  const mockGmailClient = (
    messagesGet: jest.Mock,
  ): void => {
    jest.spyOn(google, 'gmail').mockReturnValue({
      users: { messages: { get: messagesGet }, threads: { get: threadsGet } },
    } as never);
  };

  const messagesGetReturning = (
    messagesById: Record<string, Parameters<typeof createRawGmailMessage>[0]>,
  ): jest.Mock =>
    jest.fn(({ id }: { id: string }) =>
      Promise.resolve({ data: createRawGmailMessage(messagesById[id]) }),
    );

  const allFoldersChannel = {
    messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
    messageFolders: [],
  } as never;

  const selectedFoldersChannel = (syncedExternalIds: string[]) =>
    ({
      messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
      messageFolders: syncedExternalIds.map((externalId) =>
        createMockMessageFolder({ externalId, isSynced: true }),
      ),
    }) as never;

  it('should return every fetched message when policy is ALL_FOLDERS', async () => {
    const messagesGet = messagesGetReturning({
      'msg-1': { id: 'msg-1', threadId: 'thread-1', labelIds: ['INBOX'] },
      'msg-2': { id: 'msg-2', threadId: 'thread-2', labelIds: ['Label_other'] },
    });

    mockGmailClient(messagesGet);

    const result = await service.getMessages(
      ['msg-1', 'msg-2'],
      mockConnectedAccount,
      allFoldersChannel,
    );

    expect(result.map((message) => message.externalId).sort()).toStrictEqual([
      'msg-1',
      'msg-2',
    ]);
  });

  it('should return no messages when SELECTED_FOLDERS has no synced folder', async () => {
    const messagesGet = messagesGetReturning({
      'msg-1': { id: 'msg-1', threadId: 'thread-1', labelIds: ['Label_custom'] },
    });

    mockGmailClient(messagesGet);

    const channelWithoutSyncedFolder = {
      messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
      messageFolders: [
        createMockMessageFolder({ externalId: 'Label_custom', isSynced: false }),
      ],
    } as never;

    const result = await service.getMessages(
      ['msg-1'],
      mockConnectedAccount,
      channelWithoutSyncedFolder,
    );

    expect(result).toStrictEqual([]);
  });

  it('should sync a new message that lands in a synced folder', async () => {
    const messagesGet = messagesGetReturning({
      'msg-1': { id: 'msg-1', threadId: 'thread-1', labelIds: ['INBOX'] },
    });

    mockGmailClient(messagesGet);

    const result = await service.getMessages(
      ['msg-1'],
      mockConnectedAccount,
      selectedFoldersChannel(['INBOX']),
    );

    expect(result.map((message) => message.externalId)).toStrictEqual(['msg-1']);
  });

  it('should keep every fetched message of a thread when one of them touches a synced folder', async () => {
    const messagesGet = messagesGetReturning({
      'root': { id: 'root', threadId: 'thread-1', labelIds: ['INBOX'] },
      'reply': { id: 'reply', threadId: 'thread-1', labelIds: ['Label_other'] },
    });

    mockGmailClient(messagesGet);

    const result = await service.getMessages(
      ['root', 'reply'],
      mockConnectedAccount,
      selectedFoldersChannel(['INBOX']),
    );

    expect(result.map((message) => message.externalId).sort()).toStrictEqual([
      'reply',
      'root',
    ]);
  });

  it('should drop a fetched message whose thread never touches a synced folder', async () => {
    const messagesGet = messagesGetReturning({
      'synced': { id: 'synced', threadId: 'thread-1', labelIds: ['INBOX'] },
      'unrelated': {
        id: 'unrelated',
        threadId: 'thread-2',
        labelIds: ['Label_other'],
      },
    });

    mockGmailClient(messagesGet);

    const result = await service.getMessages(
      ['synced', 'unrelated'],
      mockConnectedAccount,
      selectedFoldersChannel(['INBOX']),
    );

    expect(result.map((message) => message.externalId)).toStrictEqual(['synced']);
  });

  it('should never call threads.get for a SELECTED_FOLDERS sync', async () => {
    const messagesGet = messagesGetReturning({
      'msg-1': { id: 'msg-1', threadId: 'thread-1', labelIds: ['INBOX'] },
      'msg-2': { id: 'msg-2', threadId: 'thread-1', labelIds: ['INBOX'] },
    });

    mockGmailClient(messagesGet);

    await service.getMessages(
      ['msg-1', 'msg-2'],
      mockConnectedAccount,
      selectedFoldersChannel(['INBOX']),
    );

    expect(threadsGet).not.toHaveBeenCalled();
  });

  it('should swallow per-message errors via the error handler and import the rest', async () => {
    const messagesGet = jest
      .fn()
      .mockRejectedValueOnce(new Error('message boom'))
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: createRawGmailMessage({
            id: 'msg-2',
            threadId: 'thread-2',
            labelIds: ['INBOX'],
          }),
        }),
      );

    mockGmailClient(messagesGet);

    const result = await service.getMessages(
      ['msg-1', 'msg-2'],
      mockConnectedAccount,
      selectedFoldersChannel(['INBOX']),
    );

    expect(errorHandler.handleError).toHaveBeenCalledWith(
      expect.any(Error),
      'msg-1',
    );
    expect(result.map((message) => message.externalId)).toStrictEqual(['msg-2']);
  });
});
