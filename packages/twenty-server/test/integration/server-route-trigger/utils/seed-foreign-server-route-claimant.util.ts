import { insertCatalogApplicationRegistration } from 'test/integration/metadata/suites/application/utils/insert-catalog-application-registration.util';
import { insertApplication } from 'test/integration/server-route-trigger/utils/insert-application.util';
import { insertServerRouteLogicFunction } from 'test/integration/server-route-trigger/utils/insert-server-route-logic-function.util';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export const seedForeignServerRouteClaimant = async ({
  applicationUniversalIdentifier,
  resolverUniversalIdentifier,
  workspaceId = SEED_YCOMBINATOR_WORKSPACE_ID,
}: {
  applicationUniversalIdentifier: string;
  resolverUniversalIdentifier: string;
  workspaceId?: string;
}): Promise<{ logicFunctionId: string }> => {
  const applicationRegistrationId = await insertCatalogApplicationRegistration({
    universalIdentifier: applicationUniversalIdentifier,
    name: 'Foreign server route claimant',
    sourceType: ApplicationRegistrationSourceType.TARBALL,
    workspaceId,
  });

  const applicationId = await insertApplication({
    universalIdentifier: applicationUniversalIdentifier,
    name: 'Foreign server route claimant',
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

export const removeForeignServerRouteClaimant = async ({
  applicationUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
}): Promise<void> => {
  await globalThis.testDataSource.query(
    `DELETE FROM core."application" WHERE "universalIdentifier" = $1`,
    [applicationUniversalIdentifier],
  );
  await globalThis.testDataSource.query(
    `DELETE FROM core."applicationRegistration" WHERE "universalIdentifier" = $1`,
    [applicationUniversalIdentifier],
  );
};
