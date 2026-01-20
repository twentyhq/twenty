import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

type FolderInput = Pick<
  MessageFolderWorkspaceEntity,
  'externalId' | 'name' | 'parentFolderId'
>;

export const buildGmailLabelSearchName = (
  folder: FolderInput,
  allFolders: FolderInput[],
): string | null => {
  if (!folder.name) {
    return null;
  }

  const folderMap = new Map(
    allFolders
      .filter((folder) => folder.externalId)
      .map((folder) => [folder.externalId, folder]),
  );

  const pathParts: string[] = [];
  let current: FolderInput | undefined = folder;

  while (current?.name) {
    pathParts.unshift(current.name);
    current = current.parentFolderId
      ? folderMap.get(current.parentFolderId)
      : undefined;
  }

  return pathParts
    .join('/')
    .replace(/[\s/]+/g, '-')
    .toLowerCase();
};
