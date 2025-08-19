export const getDeletedPathsFromOldAndNewStepBody = (
  oldPaths: string[],
  newPaths: string[] | null,
): string[] | null => {
  if (newPaths === null || newPaths.length <= 0) return oldPaths;
  const paths = oldPaths.filter((oldPath) => !newPaths.includes(oldPath));

  return paths.length > 0 ? paths : null;
};
