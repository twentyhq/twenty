import { insertApplication } from 'test/integration/server-route-trigger/utils/insert-application.util';
import { insertServerRouteLogicFunction } from 'test/integration/server-route-trigger/utils/insert-server-route-logic-function.util';

import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export const seedApplicationInstallInForeignWorkspace = async ({
  applicationUniversalIdentifier,
  resolverUniversalIdentifier,
  workspaceId = SEED_YCOMBINATOR_WORKSPACE_ID,
}: {
  applicationUniversalIdentifier: string;
  resolverUniversalIdentifier: string;
  workspaceId?: string;
}): Promise<{ logicFunctionId: string }> => {
  const [{ id: applicationRegistrationId }] =
    await globalThis.testDataSource.query(
      `SELECT id FROM core."applicationRegistration" WHERE "universalIdentifier" = $1`,
      [applicationUniversalIdentifier],
    );

  const applicationId = await insertApplication({
    universalIdentifier: applicationUniversalIdentifier,
    name: 'Installed copy',
    workspaceId,
    applicationRegistrationId,
  });

  const logicFunctionId = await insertServerRouteLogicFunction({
    universalIdentifier: resolverUniversalIdentifier,
    applicationId,
    workspaceId,
  });

  return { logicFunctionId };
};

export const removeApplicationInstallFromForeignWorkspace = async ({
  applicationUniversalIdentifier,
  workspaceId = SEED_YCOMBINATOR_WORKSPACE_ID,
}: {
  applicationUniversalIdentifier: string;
  workspaceId?: string;
}): Promise<void> => {
  await globalThis.testDataSource.query(
    `DELETE FROM core."application"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [applicationUniversalIdentifier, workspaceId],
  );
};
