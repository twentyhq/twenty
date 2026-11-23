export const findViewOwnership = async (
  viewId: string,
): Promise<{ visibility: string; createdByUserWorkspaceId: string | null }> => {
  const [view] = await globalThis.testDataSource.query(
    `SELECT visibility, "createdByUserWorkspaceId" FROM core."view" WHERE id = $1`,
    [viewId],
  );

  return view;
};
