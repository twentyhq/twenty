import { MessageFolderPendingSyncAction } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { computeFoldersToUpdate } from 'src/modules/messaging/message-folder-manager/utils/compute-folders-to-update.util';

describe('computeFoldersToUpdate', () => {
  it('should detect folder rename from provider', () => {
    const discoveredFolders = [
      {
        name: 'Work Emails',
        externalId: 'label-123',
        isSynced: true,
        isSentFolder: false,
        parentFolderId: null,
      },
    ];

    const existingFolders = [
      {
        id: 'folder-id',
        name: 'Old Label Name',
        externalId: 'label-123',
        isSynced: true,
        isSentFolder: false,
        parentFolderId: null,
        syncCursor: 'cursor',
        pendingSyncAction: MessageFolderPendingSyncAction.NONE,
      },
    ];

    const result = computeFoldersToUpdate({
      discoveredFolders,
      existingFolders,
    });

    expect(result.get('folder-id')?.name).toBe('Work Emails');
  });

  it('should detect folder moved to different parent', () => {
    const discoveredFolders = [
      {
        name: 'Subfolder',
        externalId: 'sub-1',
        isSynced: true,
        isSentFolder: false,
        parentFolderId: 'new-parent-id',
      },
    ];

    const existingFolders = [
      {
        id: 'folder-id',
        name: 'Subfolder',
        externalId: 'sub-1',
        isSynced: true,
        isSentFolder: false,
        parentFolderId: 'old-parent-id',
        syncCursor: 'cursor',
        pendingSyncAction: MessageFolderPendingSyncAction.NONE,
      },
    ];

    const result = computeFoldersToUpdate({
      discoveredFolders,
      existingFolders,
    });

    expect(result.get('folder-id')?.parentFolderId).toBe('new-parent-id');
  });

  it('should not flag unchanged folders for update', () => {
    const folder = {
      name: 'Inbox',
      externalId: 'INBOX',
      isSynced: true,
      isSentFolder: false,
      parentFolderId: null,
    };

    const discoveredFolders = [folder];
    const existingFolders = [
      {
        ...folder,
        id: 'folder-id',
        syncCursor: 'cursor',
        pendingSyncAction: MessageFolderPendingSyncAction.NONE,
      },
    ];

    const result = computeFoldersToUpdate({
      discoveredFolders,
      existingFolders,
    });

    expect(result.size).toBe(0);
  });

  it('should treat empty string parentFolderId same as null', () => {
    const discoveredFolders = [
      {
        name: 'Folder',
        externalId: 'ext-1',
        isSynced: true,
        isSentFolder: false,
        parentFolderId: '',
      },
    ];

    const existingFolders = [
      {
        id: 'folder-id',
        name: 'Folder',
        externalId: 'ext-1',
        isSynced: true,
        isSentFolder: false,
        parentFolderId: null,
        syncCursor: 'cursor',
        pendingSyncAction: MessageFolderPendingSyncAction.NONE,
      },
    ];

    const result = computeFoldersToUpdate({
      discoveredFolders,
      existingFolders,
    });

    expect(result.size).toBe(0);
  });
});
