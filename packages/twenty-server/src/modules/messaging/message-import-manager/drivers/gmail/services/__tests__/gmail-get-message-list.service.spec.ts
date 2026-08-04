import { Test, type TestingModule } from '@nestjs/testing';
import { ConnectedAccountProvider, MessageFolderImportPolicy } from 'twenty-shared/types';

import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import { GmailGetHistoryService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-history.service';
import { GmailGetMessageListService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-message-list.service';
import { GmailMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-message-list-fetch-error-handler.service';

describe('GmailGetMessageListService', () => {
  let service: GmailGetMessageListService;
  let gmailGetHistoryService: GmailGetHistoryService;

  const mockConnectedAccount = {
    id: 'connected-account-id',
    provider: ConnectedAccountProvider.GOOGLE,
    handle: 'test@gmail.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GmailGetMessageListService,
        {
          provide: GmailGetHistoryService,
          useValue: {
            getHistory: jest.fn().mockResolvedValue({
              history: [],
              historyId: '100',
            }),
            getMessageIdsFromHistory: jest.fn().mockResolvedValue({
              messagesAdded: ['msg-1'],
              messagesDeleted: [],
            }),
          },
        },
        {
          provide: GoogleOAuth2ClientProvider,
          useValue: {
            getClient: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: GmailMessageListFetchErrorHandler,
          useValue: {
            handleError: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GmailGetMessageListService>(GmailGetMessageListService);
    gmailGetHistoryService = module.get<GmailGetHistoryService>(GmailGetHistoryService);
  });

  describe('getMessageLists with syncCursor (incremental sync)', () => {
    it('should query history with labelId when SELECTED_FOLDERS policy is active', async () => {
      const mockFolders = [
        {
          name: 'CRM',
          externalId: 'Label_CRM',
          isSynced: true,
          parentFolderId: null,
        },
        {
          name: 'Archive',
          externalId: 'Label_Archive',
          isSynced: false,
          parentFolderId: null,
        },
      ];

      const response = await service.getMessageLists({
        connectedAccount: mockConnectedAccount,
        messageChannel: {
          id: 'channel-id',
          messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
          syncCursor: '50',
        },
        messageFolders: mockFolders,
      });

      expect(gmailGetHistoryService.getHistory).toHaveBeenCalledTimes(1);
      expect(gmailGetHistoryService.getHistory).toHaveBeenCalledWith(
        expect.anything(),
        '50',
        'Label_CRM',
      );
      expect(response).toEqual([
        {
          messageExternalIds: ['msg-1'],
          messageExternalIdsToDelete: [],
          previousSyncCursor: '50',
          nextSyncCursor: '100',
          folderId: undefined,
        },
      ]);
    });

    it('should query history without labelId when ALL_FOLDERS policy is active', async () => {
      const mockFolders = [
        {
          name: 'CRM',
          externalId: 'Label_CRM',
          isSynced: true,
          parentFolderId: null,
        },
      ];

      await service.getMessageLists({
        connectedAccount: mockConnectedAccount,
        messageChannel: {
          id: 'channel-id',
          messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
          syncCursor: '50',
        },
        messageFolders: mockFolders,
      });

      expect(gmailGetHistoryService.getHistory).toHaveBeenCalledTimes(1);
      expect(gmailGetHistoryService.getHistory).toHaveBeenCalledWith(
        expect.anything(),
        '50',
      );
    });
  });
});
