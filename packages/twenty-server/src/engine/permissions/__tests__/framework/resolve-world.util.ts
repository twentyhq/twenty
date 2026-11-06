import { isDefined } from 'twenty-shared/utils';

import { buildAuthContextOrThrow } from 'src/engine/permissions/__tests__/framework/build-auth-context.util';
import { buildWorldCacheValues } from 'src/engine/permissions/__tests__/framework/build-permission-cache-values.util';
import { buildPermissionServices } from 'src/engine/permissions/__tests__/framework/build-permission-services.util';
import {
  type GivenPrincipals,
  type RecordAccessWorld,
  type RoleGrant,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';
import {
  APPLICATION_ROLE_ID,
  LIMITING_ROLE_ID,
  MAIN_ROLE_ID,
  WORKSPACE_ID,
} from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import { type StoredRecords } from 'src/engine/permissions/__tests__/framework/stored-records.util';
import { buildRolePermissionsPrincipals } from 'src/engine/permissions/internal/principal/utils/build-role-permissions-principals.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

const findExpectedApplicationRoleId = (
  applicationPrincipal: GivenPrincipals<RoleGrant>['applicationPrincipal'],
) => {
  switch (applicationPrincipal.type) {
    case 'application':
      return APPLICATION_ROLE_ID;
    case 'oauthApplication':
    case 'sameApplicationAsMain':
      return MAIN_ROLE_ID;
    case 'customApplication':
      return undefined;
  }
};

const assertPrincipalsMatchWorldOrThrow = ({
  principals,
  world: { mainPrincipal, limitingPrincipal, applicationPrincipal },
}: {
  principals: PermissionsPrincipalsWithRolesContext;
  world: GivenPrincipals<RoleGrant>;
}) => {
  const resolved = {
    mainType: principals.mainPrincipal.type,
    limitingRoleId: principals.limitingPrincipal?.roleId,
    applicationRoleId:
      principals.applicationPrincipal.type === 'customApplication'
        ? undefined
        : principals.applicationPrincipal.roleId,
  };
  const expected = {
    mainType: mainPrincipal.type,
    limitingRoleId:
      limitingPrincipal.type === 'agent' ? LIMITING_ROLE_ID : undefined,
    applicationRoleId: findExpectedApplicationRoleId(applicationPrincipal),
  };

  if (JSON.stringify(resolved) !== JSON.stringify(expected)) {
    throw new Error(
      `Principals resolved to ${JSON.stringify(resolved)} instead of ${JSON.stringify(expected)}`,
    );
  }
};

export const resolveWorldOrThrow = async ({
  world,
  storedRecords,
}: {
  world: RecordAccessWorld;
  storedRecords?: StoredRecords;
}) => {
  const { cacheValues, flatObjectMetadata } = buildWorldCacheValues(world);
  const services = buildPermissionServices({ cacheValues, storedRecords });
  const authContext = buildAuthContextOrThrow({
    principals: world,
    aiRunScope: world.aiRunScope,
  });
  const principals = isDefined(authContext)
    ? await services.principalPermissionsService.buildPermissionsPrincipalsOrThrow(
        { authContext },
      )
    : buildRolePermissionsPrincipals({
        workspaceId: WORKSPACE_ID,
        roleId: MAIN_ROLE_ID,
      });

  assertPrincipalsMatchWorldOrThrow({ principals, world });

  return {
    services,
    authContext,
    principals,
    flatObjectMetadata,
    metadataMaps: await services.permissionsMetadataMapsService.load({
      workspaceId: WORKSPACE_ID,
    }),
  };
};
