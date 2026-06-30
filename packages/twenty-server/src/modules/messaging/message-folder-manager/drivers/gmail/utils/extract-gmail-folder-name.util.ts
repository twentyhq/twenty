export const extractGmailFolderName = (labelName: string): string => {
  if (!labelName.includes('/')) {
    return labelName;
  }

  return labelName.substring(labelName.lastIndexOf('/') + 1);
};
