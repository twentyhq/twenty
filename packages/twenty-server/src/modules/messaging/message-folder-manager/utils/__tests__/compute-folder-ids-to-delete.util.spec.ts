import { MessageFolderPendingSyncAction } from 'twenty-shared/types';
import { computeFolderIdsToDelete } from 'src/modules/messaging/message-folder-manager/utils/compute-folder-ids-to-delete.util';

describe('computeFolderIdsToDelete', () => {
  it('should mark folders deleted from provider for deletion', () => {
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
        id: 'inbox-id',
        name: 'Inbox',
        externalId: 'INBOX',
        isSynced: true,
        isSentFolder: false,
        parentFolderId: null,
        syncCursor: 'cursor',
        pendingSyncAction: MessageFolderPendingSyncAction.NONE,
      },
      {
        id: 'deleted-label-id',
        name: 'Old Label',
        externalId: 'deleted-label',
        isSynced: true,
        isSentFolder: false,
        parentFolderId: null,
        syncCursor: 'cursor',
        pendingSyncAction: MessageFolderPendingSyncAction.NONE,
      },
    ];

    const result = computeFolderIdsToDelete({
      discoveredFolders,
      existingFolders,
    });

    expect(result).toEqual(['deleted-label-id']);
  });

  it('should return empty when all local folders still exist in provider', () => {
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
        id: 'inbox-id',
        name: 'Inbox',
        externalId: 'INBOX',
        isSynced: true,
        isSentFolder: false,
        parentFolderId: null,
        syncCursor: 'cursor',
        pendingSyncAction: MessageFolderPendingSyncAction.NONE,
      },
    ];

    const result = computeFolderIdsToDelete({
      discoveredFolders,
      existingFolders,
    });

    expect(result).toEqual([]);
  });

  it('should not delete a stored decomposed externalId when discovery returns its NFC form', () => {
    const discoveredFolders = [
      {
        name: 'Anémo',
        externalId: 'An\u00e9mo:7',
        isSynced: true,
        isSentFolder: false,
        parentFolderId: null,
      },
    ];

    const existingFolders = [
      {
        id: 'folder-id',
        name: 'Anémo',
        externalId: 'Ane\u0301mo:7',
        isSynced: true,
        isSentFolder: false,
        parentFolderId: null,
        syncCursor: 'cursor',
        pendingSyncAction: MessageFolderPendingSyncAction.NONE,
      },
    ];

    const result = computeFolderIdsToDelete({
      discoveredFolders,
      existingFolders,
    });

    expect(result).toEqual([]);
  });
});
