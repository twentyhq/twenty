import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { type MessageFolder } from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { ImapGetAllFoldersService } from '../imap-get-all-folders.service';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapFindSentFolderService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-find-sent-folder.service';

const mockConnectedAccount = {
  id: 'account-1',
  handle: 'test@example.com',
  provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
  connectionParameters: {
    IMAP: { host: 'imap.example.com', port: 993, secure: true, password: 'pass' },
  },
} as unknown as Pick<
  ConnectedAccountWorkspaceEntity,
  'id' | 'provider' | 'connectionParameters' | 'handle'
>;

const mockMessageChannel = {
  messageFolderImportPolicy: 'all',
};

describe('ImapGetAllFoldersService', () => {
  let service: ImapGetAllFoldersService;
  let imapClientProvider: ImapClientProvider;
  let imapFindSentFolderService: ImapFindSentFolderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImapGetAllFoldersService,
        {
          provide: ImapClientProvider,
          useValue: {
            getClient: jest.fn(),
            closeClient: jest.fn(),
          },
        },
        {
          provide: ImapFindSentFolderService,
          useValue: {
            findSentFolder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ImapGetAllFoldersService>(ImapGetAllFoldersService);
    imapClientProvider = module.get<ImapClientProvider>(ImapClientProvider);
    imapFindSentFolderService = module.get<ImapFindSentFolderService>(
      ImapFindSentFolderService,
    );
  });

  it('skips STATUS call for \\Noselect folders without throwing', async () => {
    const mockClient = {
      list: jest.fn().mockResolvedValue([
        {
          path: 'INBOX',
          name: 'INBOX',
          flags: new Set<string>(['\\HasNoChildren']),
          parentPath: '',
        },
        {
          path: 'INBOX.Containers',
          name: 'Containers',
          flags: new Set<string>(['\\Noselect', '\\HasChildren']),
          parentPath: 'INBOX',
        },
        {
          path: 'INBOX.Containers.Sub1',
          name: 'Sub1',
          flags: new Set<string>(['\\HasNoChildren']),
          parentPath: 'INBOX.Containers',
        },
      ]),
      status: jest.fn().mockRejectedValue(new Error('Mailbox does not exist')),
      logout: jest.fn(),
    };

    (imapClientProvider.getClient as jest.Mock).mockResolvedValue(mockClient);
    (imapClientProvider.closeClient as jest.Mock).mockResolvedValue(undefined);
    (imapFindSentFolderService.findSentFolder as jest.Mock).mockResolvedValue(null);

    const folders = await service.getAllMessageFolders(
      mockConnectedAccount,
      mockMessageChannel as any,
    );

    // INBOX should be included
    expect(folders.some((f) => f.name === 'INBOX')).toBe(true);
    // \Noselect folder "Containers" should NOT be included (filtered by isValidMailbox)
    expect(folders.some((f) => f.name === 'Containers')).toBe(false);
    // Sub1 should be included (child of \Noselect folder, but itself is selectable)
    expect(folders.some((f) => f.name === 'Sub1')).toBe(true);

    // status() should NOT be called for Containers (it is a \Noselect folder)
    expect(mockClient.status).not.toHaveBeenCalledWith(
      'INBOX.Containers',
      expect.any(Object),
    );
  });

  it('resolves parentFolderId for children of \Noselect folders using pathToExternalIdMap', async () => {
    const mockClient = {
      list: jest.fn().mockResolvedValue([
        {
          path: 'INBOX.Parents',
          name: 'Parents',
          flags: new Set<string>(['\\Noselect', '\\HasChildren']),
          parentPath: 'INBOX',
        },
        {
          path: 'INBOX.Parents.Child',
          name: 'Child',
          flags: new Set<string>(['\\HasNoChildren']),
          parentPath: 'INBOX.Parents',
        },
      ]),
      status: jest.fn().mockRejectedValue(new Error('Mailbox does not exist')),
      logout: jest.fn(),
    };

    (imapClientProvider.getClient as jest.Mock).mockResolvedValue(mockClient);
    (imapClientProvider.closeClient as jest.Mock).mockResolvedValue(undefined);
    (imapFindSentFolderService.findSentFolder as jest.Mock).mockResolvedValue(null);

    const folders = await service.getAllMessageFolders(
      mockConnectedAccount,
      mockMessageChannel as any,
    );

    const childFolder = folders.find((f: MessageFolder) => f.name === 'Child');
    // Child's parentFolderId should be the path-based externalId of the \Noselect parent
    expect(childFolder?.parentFolderId).toBe('INBOX.Parents');

  it('excludes sent folder from results when it has \\Noselect flag to prevent APPEND failure', async () => {
    const mockClient = {
      list: jest.fn().mockResolvedValue([
        {
          path: 'INBOX',
          name: 'INBOX',
          flags: new Set<string>(['\\HasNoChildren']),
          parentPath: '',
        },
        {
          path: '[Gmail]',
          name: '[Gmail]',
          flags: new Set<string>(['\\Noselect', '\\All']),
          parentPath: '',
        },
        {
          path: '[Gmail]/Sent Mail',
          name: 'Sent Mail',
          flags: new Set<string>(['\\HasNoChildren']),
          parentPath: '[Gmail]',
        },
      ]),
      status: jest.fn().mockRejectedValue(new Error('Mailbox does not exist')),
      logout: jest.fn(),
    };

    (imapClientProvider.getClient as jest.Mock).mockResolvedValue(mockClient);
    (imapClientProvider.closeClient as jest.Mock).mockResolvedValue(undefined);
    (imapFindSentFolderService.findSentFolder as jest.Mock).mockResolvedValue({
      path: '[Gmail]/Sent Mail',
      name: 'Sent Mail',
    });

    const folders = await service.getAllMessageFolders(
      mockConnectedAccount,
      mockMessageChannel as any,
    );

    // [Gmail] is \Noselect — it should NOT be in the results
    expect(folders.some((f) => f.name === '[Gmail]')).toBe(false);
    // INBOX should still be included
    expect(folders.some((f) => f.name === 'INBOX')).toBe(true);
    // Sent Mail should be included (selectable, identified as sent folder)
    expect(folders.some((f) => f.name === 'Sent Mail')).toBe(true);
  });

  // TEST: when sent folder itself has \Noselect flag, it should be excluded
  it('skips APPEND by not including a \\Noselect sent folder from results', async () => {
    const mockClient = {
      list: jest.fn().mockResolvedValue([
        {
          path: 'INBOX',
          name: 'INBOX',
          flags: new Set<string>(['\\HasNoChildren']),
          parentPath: '',
        },
        {
          path: 'Sent',
          name: 'Sent',
          flags: new Set<string>(['\\Noselect', '\\HasChildren']),
          parentPath: '',
        },
      ]),
      status: jest.fn().mockRejectedValue(new Error('Mailbox does not exist')),
      logout: jest.fn(),
    };

    (imapClientProvider.getClient as jest.Mock).mockResolvedValue(mockClient);
    (imapClientProvider.closeClient as jest.Mock).mockResolvedValue(undefined);
    // imapFindSentFolderService returns a folder that has \Noselect flag
    (imapFindSentFolderService.findSentFolder as jest.Mock).mockResolvedValue({
      path: 'Sent',
      name: 'Sent',
    });

    const folders = await service.getAllMessageFolders(
      mockConnectedAccount,
      mockMessageChannel as any,
    );

    // Sent folder has \Noselect — it must NOT be included to prevent APPEND failure
    expect(folders.some((f) => f.name === 'Sent' && f.isSentFolder)).toBe(false);
    // INBOX should still be present
    expect(folders.some((f) => f.name === 'INBOX')).toBe(true);
  });

  });
});
