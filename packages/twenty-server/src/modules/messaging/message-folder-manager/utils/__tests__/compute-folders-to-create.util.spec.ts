import { MessageFolderPendingSyncAction } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { computeFoldersToCreate } from 'src/modules/messaging/message-folder-manager/utils/compute-folders-to-create.util';

describe('computeFoldersToCreate', () => {
  const messageChannelId = 'channel-123';

  it('should create folders that exist in provider but not locally', () => {
    const discoveredFolders = [
      {
        name: 'Inbox',
        externalId: 'INBOX',
        isSynced: true,
        isSentFolder: false,
        parentFolderId: null,
      },
      {
        name: 'Sent',
        externalId: 'SENT',
        isSynced: true,
        isSentFolder: true,
        parentFolderId: null,
      },
    ];

    const existingFolders = [
      {
        id: 'existing-id',
        name: 'Inbox',
        externalId: 'INBOX',
        isSynced: true,
        isSentFolder: false,
        parentFolderId: null,
        syncCursor: 'cursor',
        pendingSyncAction: MessageFolderPendingSyncAction.NONE,
      },
    ];

    const result = computeFoldersToCreate({
      discoveredFolders,
      existingFolders,
      messageChannelId,
    });

    expect(result).toHaveLength(1);
    expect(result[0].externalId).toBe('SENT');
    expect(result[0].messageChannelId).toBe(messageChannelId);
    expect(result[0].syncCursor).toBeNull();
  });

  it('should normalize empty parentFolderId to null', () => {
    const discoveredFolders = [
      {
        name: 'Subfolder',
        externalId: 'sub-1',
        isSynced: true,
        isSentFolder: false,
        parentFolderId: '',
      },
    ];

    const result = computeFoldersToCreate({
      discoveredFolders,
      existingFolders: [],
      messageChannelId,
    });

    expect(result[0].parentFolderId).toBeNull();
  });
});
