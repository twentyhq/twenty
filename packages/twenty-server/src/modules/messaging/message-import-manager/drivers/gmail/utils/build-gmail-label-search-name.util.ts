import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

const MAXIMUM_GMAIL_FOLDER_DEPTH = 50;

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
  let depth = 0;

  while (current?.name && depth < MAXIMUM_GMAIL_FOLDER_DEPTH) {
    pathParts.unshift(current.name);
    current = current.parentFolderId
      ? folderMap.get(current.parentFolderId)
      : undefined;
    depth++;
  }

  if (depth >= MAXIMUM_GMAIL_FOLDER_DEPTH) {
    return null;
  }

  return pathParts
    .join('/')
    .replace(/[\s/]+/g, '-')
    .toLowerCase();
};
