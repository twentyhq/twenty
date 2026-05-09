import { MessageFolderPendingSyncAction } from 'twenty-shared/types';
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
        parentFolderId: 'new-parent-ext',
      },
    ];

    const existingFolders = [
      {
        id: 'folder-id',
        name: 'Subfolder',
        externalId: 'sub-1',
        isSynced: true,
        isSentFolder: false,
        parentFolderId: 'old-parent-ext',
        syncCursor: 'cursor',
        pendingSyncAction: MessageFolderPendingSyncAction.NONE,
      },
    ];

    const result = computeFoldersToUpdate({
      discoveredFolders,
      existingFolders,
    });

    expect(result.get('folder-id')?.parentFolderId).toBe('new-parent-ext');
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

  describe('syncCursor reset logic', () => {
    it('should reset syncCursor to null when isSynced changes from false to true', () => {
      const discoveredFolders = [
        {
          name: 'Inbox',
          externalId: 'INBOX',
          isSynced: true,
          isSentFolder: false,
          parentFolderId: null,
        },
      ];

      const existingFolders = [
        {
          id: 'folder-id',
          name: 'Inbox',
          externalId: 'INBOX',
          isSynced: false,
          isSentFolder: false,
          parentFolderId: null,
          syncCursor: 'old-cursor',
          pendingSyncAction: MessageFolderPendingSyncAction.NONE,
        },
      ];

      const result = computeFoldersToUpdate({
        discoveredFolders,
        existingFolders,
      });

      expect(result.get('folder-id')?.syncCursor).toBeNull();
    });

    it('should not touch syncCursor when isSynced is already true, even if other fields change', () => {
      const discoveredFolders = [
        {
          name: 'New Name',
          externalId: 'INBOX',
          isSynced: true,
          isSentFolder: false,
          parentFolderId: null,
        },
      ];

      const existingFolders = [
        {
          id: 'folder-id',
          name: 'Old Name',
          externalId: 'INBOX',
          isSynced: true,
          isSentFolder: false,
          parentFolderId: null,
          syncCursor: 'existing-cursor',
          pendingSyncAction: MessageFolderPendingSyncAction.NONE,
        },
      ];

      const result = computeFoldersToUpdate({
        discoveredFolders,
        existingFolders,
      });

      expect(result.get('folder-id')?.name).toBe('New Name');
      expect(result.get('folder-id')).not.toHaveProperty('syncCursor');
    });
  });
});
