export const getGmailFolderParentId = (
  labelName: string,
  labelNameToIdMap: Map<string, string>,
): string | null => {
  if (!labelName.includes('/')) {
    return null;
  }
  const parentName = labelName.substring(0, labelName.lastIndexOf('/'));

  return labelNameToIdMap.get(parentName) || null;
};
