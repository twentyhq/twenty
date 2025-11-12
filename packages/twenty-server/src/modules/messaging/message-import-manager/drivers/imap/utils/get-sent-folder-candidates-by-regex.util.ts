import { type ListResponse } from 'imapflow';

import { StandardFolder } from 'src/modules/messaging/message-import-manager/drivers/types/standard-folder';
import { getStandardFolderByRegex } from 'src/modules/messaging/message-import-manager/drivers/utils/get-standard-folder-by-regex';

export function getImapSentFolderCandidatesByRegex(
  list: ListResponse[],
): { name: string; path: string }[] {
  const regexCandidateFolders: string[] = [];

  for (const folder of list) {
    const standardFolder = getStandardFolderByRegex(folder.path);

    if (standardFolder === StandardFolder.SENT) {
      regexCandidateFolders.push(folder.path);
    }
  }

  return regexCandidateFolders.map((folderPath) => {
    const folder = list.find((folder) => folder.path === folderPath);

    return {
      name: folder?.name ?? folderPath,
      path: folderPath,
    };
  });
}
