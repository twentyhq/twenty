import { isDefined } from 'twenty-shared/utils';

import { type AppMessageFolderInput } from 'src/engine/metadata-modules/message-channel/dtos/sync-app-message-folders.input';
import { type MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';

type ExistingFolder = Pick<
  MessageFolderEntity,
  'id' | 'externalId' | 'name' | 'isSynced'
>;

export type AppMessageFolderSyncPlan = {
  foldersToCreate: Required<AppMessageFolderInput>[];
  foldersToUpdate: {
    id: string;
    update: Partial<Pick<MessageFolderEntity, 'name' | 'isSynced'>>;
  }[];
  folderIdsToDelete: string[];
};

export const computeAppMessageFolderSyncPlan = ({
  existingFolders,
  requestedFolders,
}: {
  existingFolders: ExistingFolder[];
  requestedFolders: AppMessageFolderInput[];
}): AppMessageFolderSyncPlan => {
  const existingFoldersByExternalId = new Map(
    existingFolders
      .filter((folder) => isDefined(folder.externalId))
      .map((folder) => [folder.externalId, folder]),
  );
  const requestedExternalIds = new Set(
    requestedFolders.map((folder) => folder.externalId),
  );

  const foldersToCreate: AppMessageFolderSyncPlan['foldersToCreate'] = [];
  const foldersToUpdate: AppMessageFolderSyncPlan['foldersToUpdate'] = [];

  for (const requestedFolder of requestedFolders) {
    const existingFolder = existingFoldersByExternalId.get(
      requestedFolder.externalId,
    );

    if (!isDefined(existingFolder)) {
      foldersToCreate.push({
        externalId: requestedFolder.externalId,
        name: requestedFolder.name,
        isSynced: requestedFolder.isSynced ?? true,
      });
      continue;
    }

    const update: AppMessageFolderSyncPlan['foldersToUpdate'][number]['update'] =
      {};

    if (existingFolder.name !== requestedFolder.name) {
      update.name = requestedFolder.name;
    }

    if (
      isDefined(requestedFolder.isSynced) &&
      existingFolder.isSynced !== requestedFolder.isSynced
    ) {
      update.isSynced = requestedFolder.isSynced;
    }

    if (Object.keys(update).length > 0) {
      foldersToUpdate.push({ id: existingFolder.id, update });
    }
  }

  const folderIdsToDelete = existingFolders
    .filter(
      (folder) =>
        !isDefined(folder.externalId) ||
        !requestedExternalIds.has(folder.externalId),
    )
    .map((folder) => folder.id);

  return { foldersToCreate, foldersToUpdate, folderIdsToDelete };
};
