export const findViewOwnership = async (
  viewId: string,
): Promise<{ isPrivate: boolean; createdByUserWorkspaceId: string | null }> => {
  const [view] = await globalThis.testDataSource.query(
    `SELECT "isPrivate", "createdByUserWorkspaceId" FROM core."view" WHERE id = $1`,
    [viewId],
  );

  return view;
};
