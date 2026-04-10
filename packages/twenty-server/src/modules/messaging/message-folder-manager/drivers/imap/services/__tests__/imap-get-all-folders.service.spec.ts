import { Test, type TestingModule } from '@nestjs/testing';

import { type ImapFlow, type ListResponse } from 'imapflow';
import {
  ConnectedAccountProvider,
  MessageFolderImportPolicy,
} from 'twenty-shared/types';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { ImapGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/imap/services/imap-get-all-folders.service';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapFindSentFolderService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-find-sent-folder.service';

const createMockMailbox = (
  overrides: Partial<ListResponse> & Pick<ListResponse, 'path'>,
): ListResponse => ({
  pathAsListed: overrides.path,
  name: overrides.path.split('.').pop() ?? overrides.path,
  delimiter: '.',
  parent: [],
  parentPath: '',
  flags: new Set<string>(),
  listed: true,
  subscribed: true,
  ...overrides,
});

const CONNECTED_ACCOUNT: Pick<
  ConnectedAccountEntity,
  'id' | 'provider' | 'connectionParameters' | 'handle'
> = {
  id: 'account-1',
  provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
  connectionParameters: {},
  handle: 'test@example.com',
};

const MESSAGE_CHANNEL: Pick<MessageChannelEntity, 'messageFolderImportPolicy'> =
  {
    messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
  };

describe('ImapGetAllFoldersService', () => {
  let service: ImapGetAllFoldersService;
  let mockImapClient: jest.Mocked<Pick<ImapFlow, 'list' | 'status'>>;
  let imapFindSentFolderService: jest.Mocked<ImapFindSentFolderService>;

  beforeEach(async () => {
    mockImapClient = {
      list: jest.fn().mockResolvedValue([]),
      status: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImapGetAllFoldersService,
        {
          provide: ImapClientProvider,
          useValue: {
            getClient: jest.fn().mockResolvedValue(mockImapClient),
            closeClient: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ImapFindSentFolderService,
          useValue: {
            findSentFolder: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    service = module.get(ImapGetAllFoldersService);
    imapFindSentFolderService = module.get(ImapFindSentFolderService);
  });

  describe('Noselect folder handling', () => {
    it('should not issue STATUS against a \\Noselect folder', async () => {
      const mailboxList = [
        createMockMailbox({ path: 'INBOX' }),
        createMockMailbox({
          path: 'INBOX.Others',
          flags: new Set(['\\Noselect']),
        }),
        createMockMailbox({
          path: 'INBOX.Others.Sub1',
          name: 'Sub1',
          parentPath: 'INBOX.Others',
        }),
      ];

      mockImapClient.list.mockResolvedValue(mailboxList);
      mockImapClient.status.mockImplementation(async (path: string) => {
        const uidMap: Record<string, bigint> = {
          INBOX: BigInt(1),
          'INBOX.Others.Sub1': BigInt(2),
        };

        if (path in uidMap) {
          return { uidValidity: uidMap[path] } as any;
        }
        throw new Error(`Mailbox doesn't exist: ${path}`);
      });

      const result = await service.getAllMessageFolders(
        CONNECTED_ACCOUNT,
        MESSAGE_CHANNEL,
      );

      expect(mockImapClient.status).not.toHaveBeenCalledWith(
        'INBOX.Others',
        expect.anything(),
      );

      const paths = result.map((f) => f.externalId?.split(':')[0]);

      expect(paths).toContain('INBOX');
      expect(paths).toContain('INBOX.Others.Sub1');
      expect(paths).not.toContain('INBOX.Others');
    });

    it('should preserve parent references for children of \\Noselect folders', async () => {
      const mailboxList = [
        createMockMailbox({
          path: 'INBOX.Others',
          flags: new Set(['\\Noselect']),
        }),
        createMockMailbox({
          path: 'INBOX.Others.Sub1',
          name: 'Sub1',
          parentPath: 'INBOX.Others',
        }),
        createMockMailbox({
          path: 'INBOX.Others.Sub2',
          name: 'Sub2',
          parentPath: 'INBOX.Others',
        }),
      ];

      mockImapClient.list.mockResolvedValue(mailboxList);
      mockImapClient.status.mockImplementation(async (path: string) => {
        const uidMap: Record<string, bigint> = {
          'INBOX.Others.Sub1': BigInt(10),
          'INBOX.Others.Sub2': BigInt(11),
        };

        return { uidValidity: uidMap[path] } as any;
      });

      const result = await service.getAllMessageFolders(
        CONNECTED_ACCOUNT,
        MESSAGE_CHANNEL,
      );

      expect(result).toHaveLength(2);

      for (const folder of result) {
        expect(folder.parentFolderId).toBe('INBOX.Others');
      }
    });

    it('should exclude \\Noselect sent folder from results and skip STATUS', async () => {
      const mailboxList = [
        createMockMailbox({ path: 'INBOX' }),
        createMockMailbox({
          path: 'Sent',
          flags: new Set(['\\Noselect']),
        }),
      ];

      mockImapClient.list.mockResolvedValue(mailboxList);
      mockImapClient.status.mockImplementation(async () => {
        return { uidValidity: BigInt(1) } as any;
      });

      imapFindSentFolderService.findSentFolder.mockResolvedValue({
        path: 'Sent',
        name: 'Sent',
      });

      const result = await service.getAllMessageFolders(
        CONNECTED_ACCOUNT,
        MESSAGE_CHANNEL,
      );

      expect(mockImapClient.status).not.toHaveBeenCalledWith(
        'Sent',
        expect.anything(),
      );
      expect(result.find((f) => f.isSentFolder)).toBeUndefined();
    });
  });
});
