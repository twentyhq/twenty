import { Test, type TestingModule } from '@nestjs/testing';

import { type gmail_v1 } from 'googleapis';

import { MessageImportDriverExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { GmailGetHistoryService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-history.service';
import { GmailMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-message-list-fetch-error-handler.service';

describe('GmailGetHistoryService', () => {
  let service: GmailGetHistoryService;
  let errorHandler: GmailMessageListFetchErrorHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GmailGetHistoryService,
        {
          provide: GmailMessageListFetchErrorHandler,
          useValue: { handleError: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(GmailGetHistoryService);
    errorHandler = module.get(GmailMessageListFetchErrorHandler);
  });

  describe('getHistory', () => {
    it('should fetch history', async () => {
      const mockClient = {
        users: {
          history: {
            list: jest.fn().mockResolvedValue({
              data: {
                history: [{ messagesAdded: [{ message: { id: 'msg1' } }] }],
                historyId: '200',
              },
            }),
          },
        },
      } as unknown as gmail_v1.Gmail;

      const result = await service.getHistory(mockClient, '100');

      expect(result.historyId).toBe('200');
      expect(result.history).toHaveLength(1);
    });

    it('should handle pagination', async () => {
      const mockClient = {
        users: {
          history: {
            list: jest
              .fn()
              .mockResolvedValueOnce({
                data: {
                  history: [{ id: '1' }],
                  nextPageToken: 'token',
                  historyId: '200',
                },
              })
              .mockResolvedValueOnce({
                data: { history: [{ id: '2' }], historyId: '201' },
              }),
          },
        },
      } as unknown as gmail_v1.Gmail;

      const result = await service.getHistory(mockClient, '100');

      expect(result.history).toHaveLength(2);
      expect(mockClient.users.history.list).toHaveBeenCalledTimes(2);
    });

    it('should throw SYNC_CURSOR_ERROR when historyId is expired', async () => {
      const error = { code: 404, message: 'Not found' };
      const mockClient = {
        users: {
          history: {
            list: jest.fn().mockRejectedValue(error),
          },
        },
      } as unknown as gmail_v1.Gmail;

      (errorHandler.handleError as jest.Mock).mockImplementation(() => {
        throw {
          code: MessageImportDriverExceptionCode.SYNC_CURSOR_ERROR,
          message: 'Sync cursor error',
        };
      });

      await expect(
        service.getHistory(mockClient, 'expired-id'),
      ).rejects.toMatchObject({
        code: MessageImportDriverExceptionCode.SYNC_CURSOR_ERROR,
      });

      expect(errorHandler.handleError).toHaveBeenCalledWith(error);
    });

    it('should delegate other errors to error handler', async () => {
      const error = { code: 500, message: 'Server error' };
      const mockClient = {
        users: {
          history: {
            list: jest.fn().mockRejectedValue(error),
          },
        },
      } as unknown as gmail_v1.Gmail;

      await service.getHistory(mockClient, '100');

      expect(errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('getMessageIdsFromHistory', () => {
    it('should extract message IDs', async () => {
      const history: gmail_v1.Schema$History[] = [
        {
          messagesAdded: [{ message: { id: 'add1' } }],
          messagesDeleted: [{ message: { id: 'del1' } }],
        },
      ];

      const result = await service.getMessageIdsFromHistory(history);

      expect(result.messagesAdded).toEqual(['add1']);
      expect(result.messagesDeleted).toEqual(['del1']);
    });

    it('should deduplicate messages that appear in both lists', async () => {
      const history: gmail_v1.Schema$History[] = [
        {
          messagesAdded: [
            { message: { id: 'msg1' } },
            { message: { id: 'msg2' } },
          ],
          messagesDeleted: [{ message: { id: 'msg1' } }],
        },
      ];

      const result = await service.getMessageIdsFromHistory(history);

      expect(result.messagesAdded).toEqual(['msg2']);
      expect(result.messagesDeleted).toEqual([]);
    });
  });
});
