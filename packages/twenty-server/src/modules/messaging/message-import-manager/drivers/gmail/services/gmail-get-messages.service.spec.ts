import { Test, type TestingModule } from '@nestjs/testing';

import { google } from 'googleapis';
import {
  ConnectedAccountProvider,
  MessageFolderImportPolicy,
} from 'twenty-shared/types';

import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import { GmailMessagesImportErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-messages-import-error-handler.service';
import { GmailGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-messages.service';

const createGmailMessage = (id: string, labelIds: string[]) => ({
  id,
  threadId: 'thread-1',
  historyId: 'history-1',
  internalDate: '1700000000000',
  labelIds,
  payload: {
    mimeType: 'text/plain',
    headers: [
      { name: 'From', value: 'sender@example.com' },
      { name: 'To', value: 'recipient@example.com' },
      { name: 'Message-ID', value: `<${id}@example.com>` },
      { name: 'Subject', value: id },
    ],
    body: { data: Buffer.from('message body').toString('base64') },
  },
});

describe('GmailGetMessagesService', () => {
  let service: GmailGetMessagesService;
  let googleOAuth2ClientProvider: GoogleOAuth2ClientProvider;

  const connectedAccount: Pick<
    ConnectedAccountEntity,
    'provider' | 'id' | 'handle' | 'handleAliases'
  > = {
    provider: ConnectedAccountProvider.GOOGLE,
    id: 'connected-account-id',
    handle: 'recipient@example.com',
    handleAliases: [],
  };

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

    service = module.get<GmailGetMessagesService>(GmailGetMessagesService);
    googleOAuth2ClientProvider = module.get<GoogleOAuth2ClientProvider>(
      GoogleOAuth2ClientProvider,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('filters out non-selected messages when expanding a matching thread', async () => {
    const messages = {
      'message-1': createGmailMessage('message-1', ['INBOX']),
      'message-2': createGmailMessage('message-2', ['Label_selected']),
    };
    const mockGmailClient = {
      users: {
        messages: {
          get: jest.fn(({ id }: { id: string }) =>
            Promise.resolve({ data: messages[id as keyof typeof messages] }),
          ),
        },
        threads: {
          get: jest.fn().mockResolvedValue({
            data: {
              messages: [
                { id: 'message-1', labelIds: ['INBOX'] },
                { id: 'message-2', labelIds: ['Label_selected'] },
              ],
            },
          }),
        },
      },
    };

    jest.spyOn(google, 'gmail').mockReturnValue(mockGmailClient as never);
    (googleOAuth2ClientProvider.getClient as jest.Mock).mockResolvedValue({});

    const result = await service.getMessages(
      ['message-1'],
      connectedAccount,
      {
        messageFolders: [
          { externalId: 'INBOX', isSynced: false },
          { externalId: 'Label_selected', isSynced: true },
        ],
        messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
      } as Pick<
        MessageChannelEntity,
        'messageFolders' | 'messageFolderImportPolicy'
      >,
    );

    expect(result.map((message) => message.externalId)).toEqual(['message-2']);
  });
});
