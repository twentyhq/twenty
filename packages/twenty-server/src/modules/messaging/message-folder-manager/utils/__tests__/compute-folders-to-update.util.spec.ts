import { MessageFolderPendingSyncAction } from 'twenty-shared/types';
import { computeFoldersToUpdate } from 'src/modules/messaging/message-folder-manager/utils/compute-folders-to-update.util';

describe('computeFoldersToUpdate', () => {
  const emptyMap = new Map<string, string>();

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
      externalIdToUuidMap: emptyMap,
    });

    expect(result.get('folder-id')?.name).toBe('Work Emails');
  });

  it('should detect folder moved to different parent', () => {
    const existingParentUuid = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

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
        parentFolderId: 'old-parent-uuid',
        syncCursor: 'cursor',
        pendingSyncAction: MessageFolderPendingSyncAction.NONE,
      },
    ];

    const externalIdToUuidMap = new Map([
      ['new-parent-ext', existingParentUuid],
    ]);

    const result = computeFoldersToUpdate({
      discoveredFolders,
      existingFolders,
      externalIdToUuidMap,
    });

    expect(result.get('folder-id')?.parentFolderId).toBe(existingParentUuid);
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
      externalIdToUuidMap: emptyMap,
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
      externalIdToUuidMap: emptyMap,
    });

    expect(result.size).toBe(0);
  });
});
