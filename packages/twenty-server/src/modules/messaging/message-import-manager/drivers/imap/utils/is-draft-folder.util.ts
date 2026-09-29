import { isDefined } from 'twenty-shared/utils';

import { StandardFolder } from 'src/modules/messaging/message-import-manager/drivers/types/standard-folder.type';
import { getStandardFolderByRegex } from 'src/modules/messaging/message-import-manager/drivers/utils/get-standard-folder-by-regex';

// Classifies draft folders by specialUse flag or multilingual leaf folder regex matching (Issue #26099)
export const isDraftFolder = (
  folderNameOrPath?: string,
  specialUse?: string,
): boolean => {
  if (isDefined(specialUse) && specialUse.toLowerCase().includes('draft')) {
    return true;
  }

  if (!isDefined(folderNameOrPath)) {
    return false;
  }

  const leafName = folderNameOrPath.split(/[\/\.\\]/).pop();

  return (
    getStandardFolderByRegex(folderNameOrPath) === StandardFolder.DRAFTS ||
    (isDefined(leafName) &&
      getStandardFolderByRegex(leafName) === StandardFolder.DRAFTS)
  );
};
