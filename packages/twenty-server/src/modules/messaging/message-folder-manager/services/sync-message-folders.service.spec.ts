import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { type DiscoveredMessageFolder } from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import {
  MessageChannelContactAutoCreationPolicy,
  MessageChannelType,
  MessageChannelVisibility,
  MessageFolderImportPolicy,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessageFolderPendingSyncAction,
  type MessageFolderWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { GmailGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/gmail/services/gmail-get-all-folders.service';
import { ImapGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/imap/services/imap-get-all-folders.service';
import { MicrosoftGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/microsoft/services/microsoft-get-all-folders.service';
import { SyncMessageFoldersService } from 'src/modules/messaging/message-folder-manager/services/sync-message-folders.service';

type SyncedMessageFolder = Pick<
  MessageFolderWorkspaceEntity,
  | 'id'
  | 'name'
  | 'isSynced'
  | 'isSentFolder'
  | 'externalId'
  | 'syncCursor'
  | 'parentFolderId'
  | 'pendingSyncAction'
>;

const createMockMessageChannel = (
  overrides: {
    provider?: ConnectedAccountProvider;
    messageFolders?: SyncedMessageFolder[];
  } = {},
) => ({
  id: 'channel-123',
  handle: 'test@gmail.com',
  type: MessageChannelType.EMAIL,
  messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
  connectedAccount: {
    id: 'account-456',
    handle: 'test@gmail.com',
    provider: overrides.provider ?? ConnectedAccountProvider.GOOGLE,
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    connectionParameters: {},
  },
  messageFolders: overrides.messageFolders ?? [],
  visibility: MessageChannelVisibility.SHARE_EVERYTHING,
  isContactAutoCreationEnabled: false,
  contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy.NONE,
  excludeNonProfessionalEmails: false,
  excludeGroupEmails: false,
});

const createMockDiscoveredFolder = (
  overrides: Partial<DiscoveredMessageFolder> = {},
): DiscoveredMessageFolder => ({
  externalId: `external-${Math.random().toString(36).substring(7)}`,
  name: 'Test Folder',
  isSynced: false,
  isSentFolder: false,
  parentFolderId: null,
  ...overrides,
});

const createMockExistingFolder = (
  overrides: Partial<SyncedMessageFolder> = {},
): SyncedMessageFolder => ({
  id: `folder-${Math.random().toString(36).substring(7)}`,
  externalId: `external-${Math.random().toString(36).substring(7)}`,
  name: 'Existing Folder',
  isSynced: true,
  isSentFolder: false,
  syncCursor: null,
  parentFolderId: null,
  pendingSyncAction: MessageFolderPendingSyncAction.NONE,
  ...overrides,
});

describe('SyncMessageFoldersService', () => {
  let service: SyncMessageFoldersService;
  let gmailGetAllFoldersService: jest.Mocked<GmailGetAllFoldersService>;

  let mockRepository: {
    delete: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
    save: jest.Mock;
  };
  let mockTransactionManager: object;

  beforeEach(async () => {
    mockRepository = {
      delete: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      save: jest.fn().mockImplementation((folders) =>
        folders.map((folder: Partial<MessageFolderWorkspaceEntity>) => ({
          ...folder,
          id: `new-folder-${Math.random().toString(36).substring(7)}`,
          isSynced: false,
          syncCursor: null,
        })),
      ),
    };

    mockTransactionManager = {};

    const mockDataSource = {
      transaction: jest
        .fn()
        .mockImplementation((callback) => callback(mockTransactionManager)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncMessageFoldersService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: jest
              .fn()
              .mockImplementation((_, callback) => callback()),
            getRepository: jest.fn().mockResolvedValue(mockRepository),
            getDataSourceForWorkspace: jest
              .fn()
              .mockResolvedValue(mockDataSource),
            getGlobalWorkspaceDataSource: jest
              .fn()
              .mockResolvedValue(mockDataSource),
          },
        },
        {
          provide: GmailGetAllFoldersService,
          useValue: {
            getAllMessageFolders: jest.fn(),
          },
        },
        {
          provide: MicrosoftGetAllFoldersService,
          useValue: {
            getAllMessageFolders: jest.fn(),
          },
        },
        {
          provide: ImapGetAllFoldersService,
          useValue: {
            getAllMessageFolders: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SyncMessageFoldersService>(SyncMessageFoldersService);
    gmailGetAllFoldersService = module.get(GmailGetAllFoldersService);
  });

  describe('syncMessageFolders', () => {
    const workspaceId = 'workspace-789';

    describe('folder creation scenarios', () => {
      it('should create new folders when none exist locally', async () => {
        const discoveredFolders = [
          createMockDiscoveredFolder({
            externalId: 'inbox-ext',
            name: 'INBOX',
          }),
          createMockDiscoveredFolder({
            externalId: 'sent-ext',
            name: 'Sent',
            isSentFolder: true,
          }),
        ];
        const messageChannel = createMockMessageChannel({
          messageFolders: [],
        });

        gmailGetAllFoldersService.getAllMessageFolders.mockResolvedValue(
          discoveredFolders,
        );

        const result = await service.syncMessageFolders({
          messageChannel,
          workspaceId,
        });

        expect(mockRepository.save).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'INBOX',
              externalId: 'inbox-ext',
              messageChannelId: 'channel-123',
              isSentFolder: false,
            }),
            expect.objectContaining({
              name: 'Sent',
              externalId: 'sent-ext',
              messageChannelId: 'channel-123',
              isSentFolder: true,
            }),
          ]),
          {},
          mockTransactionManager,
        );
        expect(result).toHaveLength(2);
      });

      it('should handle nested folder creation with parent references', async () => {
        const discoveredFolders = [
          createMockDiscoveredFolder({
            externalId: 'parent-ext',
            name: 'Work',
            parentFolderId: null,
          }),
          createMockDiscoveredFolder({
            externalId: 'child-ext',
            name: 'Projects',
            parentFolderId: 'parent-folder-id',
          }),
        ];
        const messageChannel = createMockMessageChannel({
          messageFolders: [],
        });

        gmailGetAllFoldersService.getAllMessageFolders.mockResolvedValue(
          discoveredFolders,
        );

        await service.syncMessageFolders({
          messageChannel,
          workspaceId,
        });

        expect(mockRepository.save).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'Projects',
              parentFolderId: 'parent-folder-id',
            }),
          ]),
          {},
          mockTransactionManager,
        );
      });
    });

    describe('folder update scenarios', () => {
      it('should update folder when name changes', async () => {
        const existingFolder = createMockExistingFolder({
          id: 'folder-1',
          externalId: 'inbox-ext',
          name: 'INBOX',
        });
        const discoveredFolders = [
          createMockDiscoveredFolder({
            externalId: 'inbox-ext',
            name: 'Primary Inbox',
          }),
        ];
        const messageChannel = createMockMessageChannel({
          messageFolders: [existingFolder],
        });

        gmailGetAllFoldersService.getAllMessageFolders.mockResolvedValue(
          discoveredFolders,
        );

        const result = await service.syncMessageFolders({
          messageChannel,
          workspaceId,
        });

        expect(mockRepository.updateMany).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              criteria: 'folder-1',
              partialEntity: expect.objectContaining({ name: 'Primary Inbox' }),
            }),
          ]),
          mockTransactionManager,
        );
        expect(result).toContainEqual(
          expect.objectContaining({
            id: 'folder-1',
            name: 'Primary Inbox',
          }),
        );
      });

      it('should update folder when parent folder changes', async () => {
        const existingFolder = createMockExistingFolder({
          id: 'folder-1',
          externalId: 'child-ext',
          name: 'Projects',
          parentFolderId: 'old-parent-id',
        });
        const discoveredFolders = [
          createMockDiscoveredFolder({
            externalId: 'child-ext',
            name: 'Projects',
            parentFolderId: 'new-parent-id',
          }),
        ];
        const messageChannel = createMockMessageChannel({
          messageFolders: [existingFolder],
        });

        gmailGetAllFoldersService.getAllMessageFolders.mockResolvedValue(
          discoveredFolders,
        );

        await service.syncMessageFolders({
          messageChannel,
          workspaceId,
        });

        expect(mockRepository.updateMany).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              criteria: 'folder-1',
              partialEntity: expect.objectContaining({
                parentFolderId: 'new-parent-id',
              }),
            }),
          ]),
          mockTransactionManager,
        );
      });

      it('should not update folder when nothing has changed', async () => {
        const existingFolder = createMockExistingFolder({
          id: 'folder-1',
          externalId: 'inbox-ext',
          name: 'INBOX',
          isSentFolder: false,
          parentFolderId: null,
        });
        const discoveredFolders = [
          createMockDiscoveredFolder({
            externalId: 'inbox-ext',
            name: 'INBOX',
            isSentFolder: false,
            parentFolderId: null,
          }),
        ];
        const messageChannel = createMockMessageChannel({
          messageFolders: [existingFolder],
        });

        gmailGetAllFoldersService.getAllMessageFolders.mockResolvedValue(
          discoveredFolders,
        );

        await service.syncMessageFolders({
          messageChannel,
          workspaceId,
        });

        expect(mockRepository.updateMany).not.toHaveBeenCalled();
      });
    });

    describe('folder deletion scenarios', () => {
      it('should delete folders that no longer exist remotely', async () => {
        const existingFolders = [
          createMockExistingFolder({
            id: 'folder-1',
            externalId: 'inbox-ext',
            name: 'INBOX',
          }),
          createMockExistingFolder({
            id: 'folder-2',
            externalId: 'deleted-ext',
            name: 'Old Folder',
          }),
        ];
        const discoveredFolders = [
          createMockDiscoveredFolder({
            externalId: 'inbox-ext',
            name: 'INBOX',
          }),
        ];
        const messageChannel = createMockMessageChannel({
          messageFolders: existingFolders,
        });

        gmailGetAllFoldersService.getAllMessageFolders.mockResolvedValue(
          discoveredFolders,
        );

        const result = await service.syncMessageFolders({
          messageChannel: messageChannel,
          workspaceId,
        });

        expect(mockRepository.updateMany).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              criteria: 'folder-2',
              partialEntity: expect.objectContaining({
                pendingSyncAction: 'FOLDER_DELETION',
              }),
            }),
          ]),
          mockTransactionManager,
        );
        expect(result).toContainEqual(
          expect.objectContaining({
            id: 'folder-2',
            pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_DELETION,
          }),
        );
        expect(result).toHaveLength(2);
      });
    });

    describe('complex sync scenarios', () => {
      it('should handle simultaneous create, update, and delete operations', async () => {
        const existingFolders = [
          createMockExistingFolder({
            id: 'folder-to-update',
            externalId: 'update-ext',
            name: 'Old Name',
          }),
          createMockExistingFolder({
            id: 'folder-to-delete',
            externalId: 'delete-ext',
            name: 'To Delete',
          }),
          createMockExistingFolder({
            id: 'folder-unchanged',
            externalId: 'unchanged-ext',
            name: 'Unchanged',
          }),
        ];
        const discoveredFolders = [
          createMockDiscoveredFolder({
            externalId: 'update-ext',
            name: 'New Name',
          }),
          createMockDiscoveredFolder({
            externalId: 'unchanged-ext',
            name: 'Unchanged',
          }),
          createMockDiscoveredFolder({
            externalId: 'new-ext',
            name: 'New Folder',
          }),
        ];
        const messageChannel = createMockMessageChannel({
          messageFolders: existingFolders,
        });

        gmailGetAllFoldersService.getAllMessageFolders.mockResolvedValue(
          discoveredFolders,
        );

        const result = await service.syncMessageFolders({
          messageChannel,
          workspaceId,
        });

        expect(mockRepository.updateMany).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              criteria: 'folder-to-delete',
              partialEntity: expect.objectContaining({
                pendingSyncAction: 'FOLDER_DELETION',
              }),
            }),
          ]),
          mockTransactionManager,
        );
        expect(mockRepository.updateMany).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              criteria: 'folder-to-update',
              partialEntity: expect.objectContaining({ name: 'New Name' }),
            }),
          ]),
          mockTransactionManager,
        );
        expect(mockRepository.save).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ externalId: 'new-ext' }),
          ]),
          {},
          mockTransactionManager,
        );
        expect(result).toHaveLength(4);
        expect(result).toContainEqual(
          expect.objectContaining({
            id: 'folder-to-delete',
            pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_DELETION,
          }),
        );
      });

      it('should preserve syncCursor and isSynced for unchanged folders', async () => {
        const existingFolder = createMockExistingFolder({
          id: 'folder-1',
          externalId: 'inbox-ext',
          name: 'INBOX',
          isSynced: true,
          syncCursor: 'cursor-abc123',
        });
        const discoveredFolders = [
          createMockDiscoveredFolder({
            externalId: 'inbox-ext',
            name: 'INBOX',
          }),
        ];
        const messageChannel = createMockMessageChannel({
          messageFolders: [existingFolder],
        });

        gmailGetAllFoldersService.getAllMessageFolders.mockResolvedValue(
          discoveredFolders,
        );

        const result = await service.syncMessageFolders({
          messageChannel,
          workspaceId,
        });

        expect(result).toContainEqual(
          expect.objectContaining({
            id: 'folder-1',
            isSynced: true,
            syncCursor: 'cursor-abc123',
            pendingSyncAction: MessageFolderPendingSyncAction.NONE,
          }),
        );
      });
    });
  });
});
