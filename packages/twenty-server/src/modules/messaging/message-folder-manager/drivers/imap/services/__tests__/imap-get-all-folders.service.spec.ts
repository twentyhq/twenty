import { type ImapFlow } from 'imapflow';
import {
  MessageFolderImportPolicy,
  MessageFolderPendingSyncAction,
} from 'twenty-shared/types';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { type ImapFindSentFolderService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-find-sent-folder.service';
import { type MessageFolder } from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';
import { ImapGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/imap/services/imap-get-all-folders.service';
import { computeFolderIdsToDelete } from 'src/modules/messaging/message-folder-manager/utils/compute-folder-ids-to-delete.util';
import { computeFoldersToCreate } from 'src/modules/messaging/message-folder-manager/utils/compute-folders-to-create.util';

const messageChannelId = 'channel-1';

const connectedAccount = {
  id: 'connected-account-1',
  provider: 'imap',
  handle: 'user@example.com',
  connectionParameters: {},
  workspaceId: 'workspace-1',
} as unknown as ConnectedAccountEntity;

const messageChannel = {
  messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
} as Pick<MessageChannelEntity, 'messageFolderImportPolicy'>;

const buildExistingFolder = ({
  id,
  externalId,
}: {
  id: string;
  externalId: string;
}): MessageFolder => ({
  id,
  externalId,
  name: 'Custom',
  isSynced: true,
  isSentFolder: false,
  parentFolderId: null,
  syncCursor: 'sync-cursor',
  pendingSyncAction: MessageFolderPendingSyncAction.NONE,
});

const buildMailbox = (path: string) => ({
  path,
  name: path,
  flags: new Set<string>(),
  parentPath: null,
  status: undefined,
});

describe('ImapGetAllFoldersService', () => {
  const clientList = jest.fn();
  const clientStatus = jest.fn();

  const client = {
    enabled: new Set<string>(),
    list: clientList,
    status: clientStatus,
  } as unknown as ImapFlow;

  const service = new ImapGetAllFoldersService(
    {
      getClient: jest.fn().mockResolvedValue(client),
      closeClient: jest.fn(),
    } as unknown as ImapClientProvider,
    {
      findSentFolder: jest.fn().mockResolvedValue(undefined),
    } as unknown as ImapFindSentFolderService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps the existing externalId when the uidValidity read fails', async () => {
    clientList.mockResolvedValue([buildMailbox('Custom')]);
    clientStatus.mockRejectedValue(new Error('Connection not available'));

    const existingFolders = [
      buildExistingFolder({ id: 'custom-folder-id', externalId: 'Custom:111' }),
    ];

    const discoveredFolders = await service.getAllMessageFolders(
      connectedAccount,
      messageChannel,
      existingFolders,
    );

    expect(discoveredFolders).toHaveLength(1);
    expect(discoveredFolders[0].externalId).toBe('Custom:111');

    // The folder matches the stored one, so the sync keeps it untouched
    // instead of recreating it with isSynced turned off.
    expect(
      computeFolderIdsToDelete({
        discoveredFolders,
        existingFolders,
      }),
    ).toEqual([]);
    expect(
      computeFoldersToCreate({
        discoveredFolders,
        existingFolders,
        messageChannelId,
      }),
    ).toEqual([]);
  });

  it('falls back to the folder path when uidValidity fails and no folder exists yet', async () => {
    clientList.mockResolvedValue([buildMailbox('BrandNew')]);
    clientStatus.mockRejectedValue(new Error('Connection not available'));

    const discoveredFolders = await service.getAllMessageFolders(
      connectedAccount,
      messageChannel,
      [],
    );

    expect(discoveredFolders).toHaveLength(1);
    expect(discoveredFolders[0].externalId).toBe('BrandNew');
    expect(discoveredFolders[0].isSynced).toBe(false);
  });

  it('uses path:uidValidity when the uidValidity read succeeds', async () => {
    clientList.mockResolvedValue([buildMailbox('INBOX')]);
    clientStatus.mockResolvedValue({ uidValidity: BigInt(42) });

    const discoveredFolders = await service.getAllMessageFolders(
      connectedAccount,
      messageChannel,
      [buildExistingFolder({ id: 'inbox-folder-id', externalId: 'INBOX:42' })],
    );

    expect(discoveredFolders).toHaveLength(1);
    expect(discoveredFolders[0].externalId).toBe('INBOX:42');
  });
});
