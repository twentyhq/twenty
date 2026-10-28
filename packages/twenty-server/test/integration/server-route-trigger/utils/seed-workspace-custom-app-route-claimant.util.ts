import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

// Seeds a server-route logic function inside a workspace's own Custom
// application, with a caller-chosen id and universalIdentifier, mirroring what
// createOneLogicFunction produces for a user. Used to assert the Custom app can
// never answer a public server route.
export const seedWorkspaceCustomAppRouteClaimant = async ({
  id,
  universalIdentifier,
  workspaceId = SEED_YCOMBINATOR_WORKSPACE_ID,
}: {
  id: string;
  universalIdentifier: string;
  workspaceId?: string;
}): Promise<{ logicFunctionId: string }> => {
  const [{ workspaceCustomApplicationId }] =
    await globalThis.testDataSource.query(
      `SELECT "workspaceCustomApplicationId" FROM core."workspace" WHERE id = $1`,
      [workspaceId],
    );

  const [{ id: logicFunctionId }] = await globalThis.testDataSource.query(
    `INSERT INTO core."logicFunction"
       (id, "universalIdentifier", name, "sourceHandlerPath", "builtHandlerPath",
        "handlerName", "serverRouteTriggerSettings", "applicationId",
        "workspaceId")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      id,
      universalIdentifier,
      'custom-app-route-claimant',
      'src/custom-app-route-claimant.ts',
      'dist/custom-app-route-claimant.mjs',
      'main',
      JSON.stringify({ forwardedRequestHeaders: [] }),
      workspaceCustomApplicationId,
      workspaceId,
    ],
  );

  return { logicFunctionId };
};

export const removeWorkspaceCustomAppRouteClaimant = async ({
  id,
}: {
  id: string;
}): Promise<void> => {
  await globalThis.testDataSource.query(
    `DELETE FROM core."logicFunction" WHERE id = $1`,
    [id],
  );
};
