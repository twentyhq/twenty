import { MessageFolderPendingSyncAction } from 'twenty-shared/types';
import { computeFoldersToUpdate } from 'src/modules/messaging/message-folder-manager/utils/compute-folders-to-update.util';

/**
 * Tests for computeFoldersToUpdate - specifically the backfill behaviour.
 * Covers fix for issue #17095: toggling Gmail folder sync does not trigger backfill.
 */
describe('computeFoldersToUpdate - backfill fix #17095', () => {
  const baseExistingFolder = {
    id: 'folder-1',
    name: 'Promotions',
    externalId: 'ext-promotions',
    isSynced: false,
    isSentFolder: false,
    parentFolderId: null,
    syncCursor: 'cursor-abc-123',
    pendingSyncAction: MessageFolderPendingSyncAction.NONE,
  };

  const baseDiscoveredFolder = {
    name: 'Promotions',
    externalId: 'ext-promotions',
    isSynced: false,
    isSentFolder: false,
    parentFolderId: null,
  };

  describe('isSynced false → true (enabling sync)', () => {
    it('should reset syncCursor to null when folder is toggled to synced', () => {
      const result = computeFoldersToUpdate({
        discoveredFolders: [{ ...baseDiscoveredFolder, isSynced: true }],
        existingFolders: [{ ...baseExistingFolder, isSynced: false }],
      });

      expect(result.size).toBe(1);
      const update = result.get('folder-1');

      expect(update).toBeDefined();
      expect(update?.isSynced).toBe(true);
      // The key assertion for issue #17095: syncCursor must be null to trigger backfill
      expect(update?.syncCursor).toBeNull();
    });

    it('should include isSynced in update payload when toggled', () => {
      const result = computeFoldersToUpdate({
        discoveredFolders: [{ ...baseDiscoveredFolder, isSynced: true }],
        existingFolders: [{ ...baseExistingFolder, isSynced: false }],
      });

      const update = result.get('folder-1');

      expect(update?.isSynced).toBe(true);
    });
  });

  describe('isSynced true → false (disabling sync)', () => {
    it('should NOT reset syncCursor when folder is toggled to unsynced', () => {
      const result = computeFoldersToUpdate({
        discoveredFolders: [{ ...baseDiscoveredFolder, isSynced: false }],
        existingFolders: [
          {
            ...baseExistingFolder,
            isSynced: true,
            syncCursor: 'cursor-abc-123',
          },
        ],
      });

      const update = result.get('folder-1');

      // syncCursor should NOT be reset (no backfill needed when disabling)
      expect(update?.syncCursor).toBeUndefined();
      expect(update?.isSynced).toBe(false);
    });
  });

  describe('isSynced unchanged', () => {
    it('should NOT reset syncCursor when isSynced stays true', () => {
      const result = computeFoldersToUpdate({
        discoveredFolders: [
          {
            ...baseDiscoveredFolder,
            isSynced: true,
            name: 'Promotions Updated',
          },
        ],
        existingFolders: [{ ...baseExistingFolder, isSynced: true }],
      });

      const update = result.get('folder-1');

      if (update) {
        expect(update.syncCursor).toBeUndefined();
      }
    });

    it('should NOT reset syncCursor when isSynced stays false', () => {
      const result = computeFoldersToUpdate({
        discoveredFolders: [{ ...baseDiscoveredFolder, isSynced: false }],
        existingFolders: [{ ...baseExistingFolder, isSynced: false }],
      });

      // No change → no update
      expect(result.size).toBe(0);
    });
  });

  describe('multiple folders', () => {
    it('should only reset syncCursor for folders being toggled to synced', () => {
      const result = computeFoldersToUpdate({
        discoveredFolders: [
          {
            name: 'Inbox',
            externalId: 'ext-inbox',
            isSynced: true,
            isSentFolder: false,
            parentFolderId: null,
          },
          {
            name: 'Promotions',
            externalId: 'ext-promotions',
            isSynced: true,
            isSentFolder: false,
            parentFolderId: null,
          },
          {
            name: 'Sent',
            externalId: 'ext-sent',
            isSynced: true,
            isSentFolder: true,
            parentFolderId: null,
          },
        ],
        existingFolders: [
          {
            id: 'inbox-id',
            name: 'Inbox',
            externalId: 'ext-inbox',
            isSynced: true,
            isSentFolder: false,
            parentFolderId: null,
            syncCursor: 'inbox-cursor',
            pendingSyncAction: MessageFolderPendingSyncAction.NONE,
          },
          {
            id: 'folder-1',
            name: 'Promotions',
            externalId: 'ext-promotions',
            isSynced: false,
            isSentFolder: false,
            parentFolderId: null,
            syncCursor: 'cursor-abc-123',
            pendingSyncAction: MessageFolderPendingSyncAction.NONE,
          },
          {
            id: 'sent-id',
            name: 'Sent',
            externalId: 'ext-sent',
            isSynced: true,
            isSentFolder: true,
            parentFolderId: null,
            syncCursor: 'sent-cursor',
            pendingSyncAction: MessageFolderPendingSyncAction.NONE,
          },
        ],
      });

      // Only Promotions changed (false → true)
      expect(result.get('folder-1')?.syncCursor).toBeNull();

      // Inbox was already synced — no update expected
      expect(result.get('inbox-id')).toBeUndefined();

      // Sent was already synced — no update expected
      expect(result.get('sent-id')).toBeUndefined();
    });
  });
});
