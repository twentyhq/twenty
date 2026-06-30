import { MessageFolderImportPolicy } from 'twenty-shared/types';

export const shouldSyncFolderByDefault = (
  messageFolderImportPolicy: MessageFolderImportPolicy,
): boolean => {
  return messageFolderImportPolicy === MessageFolderImportPolicy.ALL_FOLDERS;
};
