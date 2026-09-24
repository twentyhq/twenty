export const insertServerRouteLogicFunction = async ({
  universalIdentifier,
  applicationId,
  workspaceId,
}: {
  universalIdentifier: string;
  applicationId: string;
  workspaceId: string;
}): Promise<string> => {
  const [{ id }] = await globalThis.testDataSource.query(
    `INSERT INTO core."logicFunction"
       ("universalIdentifier", name, "sourceHandlerPath", "builtHandlerPath",
        "handlerName", "serverRouteTriggerSettings", "applicationId",
        "workspaceId")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      universalIdentifier,
      'seeded-resolver',
      'src/seeded-resolver.ts',
      'dist/seeded-resolver.mjs',
      'main',
      JSON.stringify({ forwardedRequestHeaders: [] }),
      applicationId,
      workspaceId,
    ],
  );

  return id;
};
