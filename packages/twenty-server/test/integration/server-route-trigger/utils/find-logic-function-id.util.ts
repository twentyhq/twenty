export const findLogicFunctionId = async ({
  universalIdentifier,
  workspaceId,
}: {
  universalIdentifier: string;
  workspaceId: string;
}): Promise<string> => {
  const [{ id }] = await globalThis.testDataSource.query(
    `SELECT id FROM core."logicFunction"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [universalIdentifier, workspaceId],
  );

  return id;
};
