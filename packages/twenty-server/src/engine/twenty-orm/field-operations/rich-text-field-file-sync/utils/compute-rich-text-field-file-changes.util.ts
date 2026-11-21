export const computeRichTextFieldFileChanges = ({
  ownedFileIds,
  referencedFileIds,
}: {
  ownedFileIds: string[];
  referencedFileIds: string[];
}): {
  fileIdsToClaim: string[];
  fileIdsToRestore: string[];
  fileIdsToRelease: string[];
} => {
  const ownedFileIdSet = new Set(ownedFileIds);
  const referencedFileIdSet = new Set(referencedFileIds);

  return {
    fileIdsToClaim: referencedFileIds.filter(
      (fileId) => !ownedFileIdSet.has(fileId),
    ),
    fileIdsToRestore: referencedFileIds.filter((fileId) =>
      ownedFileIdSet.has(fileId),
    ),
    fileIdsToRelease: ownedFileIds.filter(
      (fileId) => !referencedFileIdSet.has(fileId),
    ),
  };
};
