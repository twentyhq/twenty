import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageFolderImportPolicy } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { ImapGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/imap/services/imap-get-all-folders.service';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapFindSentFolderService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-find-sent-folder.service';

describe('ImapGetAllFoldersService', () => {
  let service: ImapGetAllFoldersService;
  let imapClientProvider: ImapClientProvider;

  const mockConnectedAccount: Pick<
    ConnectedAccountWorkspaceEntity,
    'id' | 'provider' | 'handle' | 'connectionParameters'
  > = {
    id: 'connected-account-id',
    provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
    handle: 'test@example.com',
    connectionParameters: {},
  };

  const mockMessageChannel = {
    messageFolderImportPolicy: MessageFolderImportPolicy.SYNC_EVERYTHING,
  };

  const createMockMailbox = (
    path: string,
    name: string,
    flags: Set<string> = new Set(),
    parentPath?: string,
  ) => ({
    path,
    name,
    flags,
    parentPath: parentPath ?? null,
    status: null,
    delimiter: '.',
    specialUse: undefined,
  });

  const mockStatus = jest.fn();
  const mockList = jest.fn();
  const mockCloseClient = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();

    mockStatus.mockResolvedValue({ uidValidity: BigInt(12345) });

    const mockClient = {
      list: mockList,
      status: mockStatus,
      close: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImapGetAllFoldersService,
        {
          provide: ImapClientProvider,
          useValue: {
            getClient: jest.fn().mockResolvedValue(mockClient),
            closeClient: mockCloseClient,
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

    service = module.get<ImapGetAllFoldersService>(ImapGetAllFoldersService);
    imapClientProvider = module.get<ImapClientProvider>(ImapClientProvider);
  });

  it('should return selectable folders and skip \\Noselect folders', async () => {
    mockList.mockResolvedValue([
      createMockMailbox('INBOX', 'INBOX'),
      createMockMailbox(
        'INBOX.Others',
        'Others',
        new Set(['\\Noselect']),
      ),
      createMockMailbox('INBOX.Others.Sub1', 'Sub1', new Set(), 'INBOX.Others'),
      createMockMailbox('Sent', 'Sent'),
    ]);

    const folders = await service.getAllMessageFolders(
      mockConnectedAccount as ConnectedAccountWorkspaceEntity,
      mockMessageChannel,
    );

    // Should NOT call STATUS on \Noselect folder
    const statusCalls = mockStatus.mock.calls.map((c) => c[0]);
    expect(statusCalls).not.toContain('INBOX.Others');

    // Should call STATUS on selectable folders
    expect(statusCalls).toContain('INBOX');
    expect(statusCalls).toContain('INBOX.Others.Sub1');

    // \Noselect folder should NOT appear in results
    const folderNames = folders.map((f) => f.name);
    expect(folderNames).not.toContain('Others');

    // Subfolder should still appear and have correct parent reference
    const subFolder = folders.find((f) => f.name === 'Sub1');
    expect(subFolder).toBeDefined();
  });

  it('should handle empty mailbox list', async () => {
    mockList.mockResolvedValue([]);

    const folders = await service.getAllMessageFolders(
      mockConnectedAccount as ConnectedAccountWorkspaceEntity,
      mockMessageChannel,
    );

    expect(folders).toEqual([]);
    expect(mockStatus).not.toHaveBeenCalled();
  });

  it('should handle all \\Noselect mailboxes', async () => {
    mockList.mockResolvedValue([
      createMockMailbox(
        'INBOX.Parent',
        'Parent',
        new Set(['\\Noselect']),
      ),
      createMockMailbox(
        'INBOX.Parent.Child',
        'Child',
        new Set(['\\Noselect']),
        'INBOX.Parent',
      ),
    ]);

    const folders = await service.getAllMessageFolders(
      mockConnectedAccount as ConnectedAccountWorkspaceEntity,
      mockMessageChannel,
    );

    // No STATUS calls should be made
    expect(mockStatus).not.toHaveBeenCalled();

    // No folders should be returned (all \Noselect)
    expect(folders).toEqual([]);
  });

  it('should preserve parent folder references for \\Noselect parents', async () => {
    mockList.mockResolvedValue([
      createMockMailbox(
        'INBOX.Archive',
        'Archive',
        new Set(['\\Noselect']),
      ),
      createMockMailbox(
        'INBOX.Archive.2024',
        '2024',
        new Set(),
        'INBOX.Archive',
      ),
      createMockMailbox(
        'INBOX.Archive.2025',
        '2025',
        new Set(),
        'INBOX.Archive',
      ),
    ]);

    const folders = await service.getAllMessageFolders(
      mockConnectedAccount as ConnectedAccountWorkspaceEntity,
      mockMessageChannel,
    );

    // Child folders should have parent references
    const folder2024 = folders.find((f) => f.name === '2024');
    const folder2025 = folders.find((f) => f.name === '2025');

    expect(folder2024).toBeDefined();
    expect(folder2025).toBeDefined();

    // Parent should be the \Noselect container path
    expect(folder2024?.parentFolderId).toBe('INBOX.Archive');
    expect(folder2025?.parentFolderId).toBe('INBOX.Archive');
  });
});
