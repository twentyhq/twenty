import { randomUUID } from 'node:crypto';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordAccessPolicyService } from 'src/engine/permissions/combine/services/record-access-policy.service';
import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import { type OperationType } from 'src/engine/permissions/role/utils/validate-operation-is-permitted-or-throw.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';
import { WORKSPACE_APP_ROLE_ID } from 'src/engine/permissions/principal/constants/workspace-app-role-id.constant';

describe('RecordAccessPolicyService', () => {
  const recordId = randomUUID();
  let adminPrincipal: PermissionsPrincipal;
  let personFlatObjectMetadata: FlatObjectMetadata;
  let recordAccessPolicyService: RecordAccessPolicyService;
  const missingRolePrincipal: PermissionsPrincipal = {
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    main: { roleId: randomUUID() },
    appRoleId: WORKSPACE_APP_ROLE_ID,
  };

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

    const { flatRoleMaps, flatObjectMetadataMaps } =
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatRoleMaps',
        'flatObjectMetadataMaps',
      ]);
    const person = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatObjectMetadataMaps,
      universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
    });
    const adminRoleId = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatRoleMaps,
      universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
    })?.id;

    if (!isDefined(adminRoleId) || !isDefined(person)) {
      throw new Error('The admin role or the person object is not seeded');
    }

    personFlatObjectMetadata = person;
    recordAccessPolicyService =
      getAppProviderByClassName<RecordAccessPolicyService>(
        'RecordAccessPolicyService',
      );

    adminPrincipal = {
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      main: { roleId: adminRoleId },
      appRoleId: WORKSPACE_APP_ROLE_ID,
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

  const hasAccessToRecords = ({
    principal,
    recordIds,
    operationType = 'select',
  }: {
    principal: PermissionsPrincipal;
    recordIds: string[];
    operationType?: OperationType;
  }): Promise<boolean> =>
    recordAccessPolicyService.hasAccessToRecords({
      principal,
      flatObjectMetadata: personFlatObjectMetadata,
      operationType,
      recordIds,
    });

  describe('hasAccessToRecords', () => {
    it('grants a role reading and updating an existing record it permits', async () => {
      expect(
        await hasAccessToRecords({
          principal: adminPrincipal,
          recordIds: [recordId],
        }),
      ).toBe(true);
      expect(
        await hasAccessToRecords({
          principal: adminPrincipal,
          recordIds: [recordId],
          operationType: 'update',
        }),
      ).toBe(true);
    });

    it('denies a principal whose role does not exist', async () => {
      expect(
        await hasAccessToRecords({
          principal: missingRolePrincipal,
          recordIds: [recordId],
        }),
      ).toBe(false);
    });

    it('denies when one of the records does not exist', async () => {
      expect(
        await hasAccessToRecords({
          principal: adminPrincipal,
          recordIds: [recordId, randomUUID()],
        }),
      ).toBe(false);
    });
  });

  describe('hasAccessToSomeRecords', () => {
    it('follows the role when it permits the operation', async () => {
      expect(
        await recordAccessPolicyService.hasAccessToSomeRecords({
          principal: adminPrincipal,
          flatObjectMetadata: personFlatObjectMetadata,
          operationType: 'select',
        }),
      ).toBe(true);
    });

    it('denies a principal with no role and no share on the object', async () => {
      expect(
        await recordAccessPolicyService.hasAccessToSomeRecords({
          principal: missingRolePrincipal,
          flatObjectMetadata: personFlatObjectMetadata,
          operationType: 'select',
        }),
      ).toBe(false);
    });
  });
});
