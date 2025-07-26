import { isDefined } from 'twenty-shared/utils';

import { GmailDefaultMessageCategory } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-default-message-category.type';
import { GmailDefaultMessageFolder } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-default-message-folder.type';

const DEFAULT_FOLDER_NAME_TO_CATEGORY_MAPPING = [
  {
    folderName: GmailDefaultMessageFolder.CATEGORY_FORUMS,
    category: GmailDefaultMessageCategory.forums,
  },
  {
    folderName: GmailDefaultMessageFolder.CATEGORY_PROMOTIONS,
    category: GmailDefaultMessageCategory.promotions,
  },
  {
    folderName: GmailDefaultMessageFolder.CATEGORY_SOCIAL,
    category: GmailDefaultMessageCategory.social,
  },
  {
    folderName: GmailDefaultMessageFolder.CATEGORY_UPDATES,
    category: GmailDefaultMessageCategory.updates,
  },
];

export const mapGmailDefaultFolderToCategoryOrUndefined = (
  messageFolderName: string,
) => {
  const mapping = DEFAULT_FOLDER_NAME_TO_CATEGORY_MAPPING.find(
    ({ folderName }) => folderName === messageFolderName,
  );

  if (!isDefined(mapping)) {
    return undefined;
  }

  return mapping.category;
};
