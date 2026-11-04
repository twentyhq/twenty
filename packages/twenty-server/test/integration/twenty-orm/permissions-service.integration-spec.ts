import { type ObjectRecordsOperationType } from 'twenty-shared/types';
import { randomUUID } from 'node:crypto';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { resolveWorkspaceMemberAuthContext } from 'test/integration/utils/resolve-workspace-member-auth-context.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsService } from 'src/engine/permissions/permissions.service';
import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('PermissionsService', () => {
  const recordId = randomUUID();
  let adminAuthContext: PermissionsAuthContext;
  let personFlatObjectMetadata: FlatObjectMetadata;
  let permissionsService: PermissionsService;
  const missingRoleAuthContext: PermissionsAuthContext = {
    type: 'apiKey',
    workspace: { id: SEED_APPLE_WORKSPACE_ID },
    apiKey: { id: randomUUID() },
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

    const { flatObjectMetadataMaps } =
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, ['flatObjectMetadataMaps']);
    const person = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatObjectMetadataMaps,
      universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
    });
    if (!isDefined(person)) {
      throw new Error('The person object is not seeded');
    }

    personFlatObjectMetadata = person;
    permissionsService =
      getAppProviderByClassName<PermissionsService>('PermissionsService');

    adminAuthContext = await resolveWorkspaceMemberAuthContext({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });
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

  const askObjectQuestion = async ({
    question,
    authContext,
  }: {
    question: 'canAccessAllRecords' | 'canAccessSomeRecords';
    authContext: PermissionsAuthContext;
  }): Promise<boolean> =>
    permissionsService[question]({
      principals: await permissionsService.buildPermissionsPrincipals({
        authContext,
      }),
      objectMetadataId: personFlatObjectMetadata.id,
      operationType: 'select',
    });

  const canAccessRecords = async ({
    authContext,
    recordIds,
    operationType = 'select',
  }: {
    authContext: PermissionsAuthContext;
    recordIds: string[];
    operationType?: ObjectRecordsOperationType;
  }): Promise<boolean> =>
    permissionsService.canAccessRecords({
      principals: await permissionsService.buildPermissionsPrincipals({
        authContext,
      }),
      objectMetadataId: personFlatObjectMetadata.id,
      operationType,
      recordIds,
    });

  describe('canAccessRecords', () => {
    it('grants a role reading and updating an existing record it permits', async () => {
      expect(
        await canAccessRecords({
          authContext: adminAuthContext,
          recordIds: [recordId],
        }),
      ).toBe(true);
      expect(
        await canAccessRecords({
          authContext: adminAuthContext,
          recordIds: [recordId],
          operationType: 'update',
        }),
      ).toBe(true);
    });

    it('denies an API key without a role', async () => {
      expect(
        await canAccessRecords({
          authContext: missingRoleAuthContext,
          recordIds: [recordId],
        }),
      ).toBe(false);
    });

    it('denies when one of the records does not exist', async () => {
      expect(
        await canAccessRecords({
          authContext: adminAuthContext,
          recordIds: [recordId, randomUUID()],
        }),
      ).toBe(false);
    });
  });

  describe('findAccessibleRecordIds', () => {
    it('keeps only the records the principal is admitted to', async () => {
      expect(
        await permissionsService.findAccessibleRecordIds({
          principals: await permissionsService.buildPermissionsPrincipals({
            authContext: adminAuthContext,
          }),
          objectMetadataId: personFlatObjectMetadata.id,
          operationType: 'select',
          recordIds: [recordId, randomUUID()],
        }),
      ).toEqual([recordId]);
    });
  });

  describe.each(['canAccessAllRecords', 'canAccessSomeRecords'] as const)(
    '%s',
    (question) => {
      it('follows the role when it permits the operation', async () => {
        expect(
          await askObjectQuestion({ question, authContext: adminAuthContext }),
        ).toBe(true);
      });

      it('denies an API key with no role', async () => {
        expect(
          await askObjectQuestion({
            question,
            authContext: missingRoleAuthContext,
          }),
        ).toBe(false);
      });
    },
  );
});
