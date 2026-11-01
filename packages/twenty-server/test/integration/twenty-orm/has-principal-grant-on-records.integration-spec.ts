import { randomUUID } from 'node:crypto';

import { isDefined } from 'twenty-shared/utils';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import { type OperationType } from 'src/engine/permissions/role/utils/validate-operation-is-permitted-or-throw.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

describe('WorkspaceRepository.hasPrincipalGrantOnRecords', () => {
  const recordId = randomUUID();
  let adminPrincipal: PermissionsPrincipal;

  // Other suites wipe every person, so the record under test is created here
  beforeAll(async () => {
    const response = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        data: {
          id: recordId,
          name: { firstName: 'Row', lastName: 'Access' },
        },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    const { flatRoleMaps } =
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, ['flatRoleMaps']);
    const adminRoleId = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatRoleMaps,
      universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
    })?.id;

    if (!isDefined(adminRoleId)) {
      throw new Error('The admin role is not seeded');
    }

    adminPrincipal = {
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      intersectionOf: { userWorkspaceRoleId: adminRoleId },
    };
  });

  afterAll(async () => {
    await makeGraphqlApiRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        recordId,
      }),
    );
  });

  const hasGrant = ({
    principal,
    recordIds,
    operationType,
  }: {
    principal: PermissionsPrincipal;
    recordIds: string[];
    operationType?: OperationType;
  }): Promise<boolean> => {
    const workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );

    return workspaceOrmManager.executeInWorkspaceContext(
      () =>
        workspaceOrmManager
          .getRepository('person', { shouldBypassPermissionChecks: true })
          .hasPrincipalGrantOnRecords({ principal, recordIds, operationType }),
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );
  };

  it('grants a role every operation it permits on an existing record', async () => {
    expect(
      await hasGrant({ principal: adminPrincipal, recordIds: [recordId] }),
    ).toBe(true);
    expect(
      await hasGrant({
        principal: adminPrincipal,
        recordIds: [recordId],
        operationType: 'update',
      }),
    ).toBe(true);
  });

  it('denies a principal whose role does not exist', async () => {
    expect(
      await hasGrant({
        principal: {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          intersectionOf: { userWorkspaceRoleId: randomUUID() },
        },
        recordIds: [recordId],
      }),
    ).toBe(false);
  });

  it('denies when one of the records does not exist', async () => {
    expect(
      await hasGrant({
        principal: adminPrincipal,
        recordIds: [recordId, randomUUID()],
      }),
    ).toBe(false);
  });
});
