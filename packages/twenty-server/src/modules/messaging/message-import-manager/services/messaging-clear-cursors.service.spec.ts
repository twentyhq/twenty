import { Test, type TestingModule } from '@nestjs/testing';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessagingClearCursorsService } from 'src/modules/messaging/message-import-manager/services/messaging-clear-cursors.service';

describe('MessagingClearCursorsService', () => {
  let service: MessagingClearCursorsService;

  const mockMessageChannelRepository = {
    update: jest.fn(),
  };

  const mockMessageFolderRepository = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingClearCursorsService,
        {
          provide: TwentyORMManager,
          useValue: {
            getRepository: jest.fn((entityName) => {
              if (entityName === 'messageChannel') {
                return mockMessageChannelRepository;
              }
              if (entityName === 'messageFolder') {
                return mockMessageFolderRepository;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get(MessagingClearCursorsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('clearAllMessageChannelCursors', () => {
    const messageChannelId = 'test-channel-id';

    it('should clear message channel and folder cursors', async () => {
      await service.clearAllMessageChannelCursors(messageChannelId);

      expect(mockMessageChannelRepository.update).toHaveBeenCalledWith(
        { id: messageChannelId },
        { syncCursor: '' },
        undefined,
      );
      expect(mockMessageFolderRepository.update).toHaveBeenCalledWith(
        { messageChannelId },
        { syncCursor: '' },
        undefined,
      );
    });
  });
});
