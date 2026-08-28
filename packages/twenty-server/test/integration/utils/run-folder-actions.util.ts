import { MessageFolderPendingSyncAction } from 'twenty-shared/types';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { type MessagingImportFolderMessagesService } from 'src/modules/messaging/message-import-manager/services/messaging-import-folder-messages.service';
import { type MessagingProcessFolderActionsService } from 'src/modules/messaging/message-import-manager/services/messaging-process-folder-actions.service';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

export const MESSAGE_COUNT_ABOVE_V8_SPREAD_ARGUMENT_LIMIT = 200000;

export const FOLDER_ACTION_NAMES = {
  imported: 'Large import folder',
  failing: 'Failing import folder',
  untouched: 'Untouched folder',
};

const MESSAGE_EXTERNAL_IDS = Array.from(
  { length: MESSAGE_COUNT_ABOVE_V8_SPREAD_ARGUMENT_LIMIT },
  (_, index) => `large-folder-message-${index}`,
);

const getMessageFolderRepository = () =>
  getCoreRepository<MessageFolderEntity>(MessageFolderEntity);

const getMessageChannel = (messageChannelId: string) =>
  getCoreRepository<MessageChannelEntity>(MessageChannelEntity).findOneByOrFail(
    { id: messageChannelId },
  );

const processFolderActions = (
  messageChannel: MessageChannelEntity,
  messageFolders: MessageFolderEntity[],
) =>
  getAppProviderByClassName<MessagingProcessFolderActionsService>(
    'MessagingProcessFolderActionsService',
  ).processFolderActions(
    messageChannel,
    messageFolders,
    messageChannel.workspaceId,
  );

export const runFolderActions = async ({
  messageChannelId,
  folderNameToDelete,
}: {
  messageChannelId: string;
  folderNameToDelete: string;
}): Promise<string[]> => {
  const messageChannel = await getMessageChannel(messageChannelId);
  const messageFolderRepository = getMessageFolderRepository();

  const buildFolder = (
    name: string,
    pendingSyncAction: MessageFolderPendingSyncAction,
  ) => ({
    messageChannelId,
    workspaceId: messageChannel.workspaceId,
    name,
    externalId: `${name}-external-id`,
    isSentFolder: false,
    isSynced: true,
    pendingSyncAction,
  });

  await messageFolderRepository.save([
    buildFolder(
      FOLDER_ACTION_NAMES.imported,
      MessageFolderPendingSyncAction.FOLDER_IMPORT,
    ),
    buildFolder(
      FOLDER_ACTION_NAMES.failing,
      MessageFolderPendingSyncAction.FOLDER_IMPORT,
    ),
    buildFolder(
      FOLDER_ACTION_NAMES.untouched,
      MessageFolderPendingSyncAction.NONE,
    ),
  ]);

  const folderToDelete = await messageFolderRepository.findOneByOrFail({
    messageChannelId,
    name: folderNameToDelete,
  });

  await messageFolderRepository.update(
    { id: folderToDelete.id },
    { pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_DELETION },
  );

  const failingFolder = await messageFolderRepository.findOneByOrFail({
    messageChannelId,
    name: FOLDER_ACTION_NAMES.failing,
  });

  jest
    .spyOn(
      getAppProviderByClassName<MessagingImportFolderMessagesService>(
        'MessagingImportFolderMessagesService',
      ),
      'getFolderMessageIdsToImport',
    )
    .mockImplementation(async (_messageChannel, messageFolder) => {
      if (messageFolder.id === failingFolder.id) {
        throw new Error('Folder import failed');
      }

      return [...MESSAGE_EXTERNAL_IDS, MESSAGE_EXTERNAL_IDS[0]];
    });

  const { messageExternalIdsToImport } = await processFolderActions(
    messageChannel,
    await messageFolderRepository.findBy({ messageChannelId }),
  );

  return messageExternalIdsToImport;
};

export const runFolderActionsWithoutPendingActions = async (
  messageChannelId: string,
): Promise<string[]> => {
  const messageChannel = await getMessageChannel(messageChannelId);

  const untouchedFolder = await getMessageFolderRepository().findOneByOrFail({
    messageChannelId,
    name: FOLDER_ACTION_NAMES.untouched,
  });

  const { messageExternalIdsToImport } = await processFolderActions(
    messageChannel,
    [untouchedFolder],
  );

  return messageExternalIdsToImport;
};
