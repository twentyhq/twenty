import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImapSyncService } from '../imap-sync.service';
import { ImapClientService } from '../imap-client.service';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/common/standard-objects/message-channel.object-metadata';
import { MessageObjectMetadata } from 'src/modules/messaging/common/standard-objects/message.object-metadata';

describe('ImapSyncService', () => {
  let service: ImapSyncService;
  let imapClient: ImapClientService;
  let messageRepository: Repository<MessageObjectMetadata>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImapSyncService,
        {
          provide: ImapClientService,
          useValue: {
            getFolders: jest.fn(),
            fetchMessages: jest.fn(),
            getUidValidity: jest.fn(),
            getMessageCount: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MessageChannelObjectMetadata),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MessageObjectMetadata),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ImapSyncService>(ImapSyncService);
    imapClient = module.get<ImapClientService>(ImapClientService);
    messageRepository = module.get<Repository<MessageObjectMetadata>>(
      getRepositoryToken(MessageObjectMetadata),
    );
  });

  describe('syncMailbox', () => {
    const mockConfig = {
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      auth: { user: 'test@gmail.com', pass: 'password' },
    };

    it('should sync all main folders', async () => {
      const mockFolders = [
        { path: 'INBOX', name: 'INBOX', delimiter: '/', flags: [], specialUse: '\\Inbox' },
        { path: '[Gmail]/Sent Mail', name: 'Sent Mail', delimiter: '/', flags: [], specialUse: '\\Sent' },
      ];

      jest.spyOn(imapClient, 'getFolders').mockResolvedValue(mockFolders);
      jest.spyOn(imapClient, 'getUidValidity').mockResolvedValue(12345);
      jest.spyOn(imapClient, 'fetchMessages').mockResolvedValue([
        {
          uid: 1,
          messageId: 'test-1@example.com',
          subject: 'Test Email',
          from: [{ name: 'Sender', address: 'sender@example.com' }],
          to: [{ address: 'test@gmail.com' }],
          date: new Date(),
          text: 'Test body',
          flags: [],
          seen: false,
        },
      ]);

      const result = await service.syncMailbox(mockConfig, 'channel-1');

      expect(result.synced).toBeGreaterThan(0);
      expect(imapClient.getFolders).toHaveBeenCalled();
    });

    it('should handle sync errors gracefully', async () => {
      jest.spyOn(imapClient, 'getFolders').mockRejectedValue(new Error('Connection failed'));

      await expect(service.syncMailbox(mockConfig, 'channel-1')).rejects.toThrow('Connection failed');
    });
  });

  describe('filterMainFolders', () => {
    it('should filter main folders correctly', () => {
      const folders = [
        { path: 'INBOX', name: 'INBOX', flags: [], specialUse: '\\Inbox' },
        { path: 'Drafts', name: 'Drafts', flags: [], specialUse: '\\Drafts' },
        { path: 'Custom', name: 'Custom', flags: [] },
      ];

      const result = (service as any).filterMainFolders(folders);

      expect(result).toHaveLength(2);
      expect(result.map((f: any) => f.name)).toContain('INBOX');
      expect(result.map((f: any) => f.name)).toContain('Drafts');
    });
  });
});
