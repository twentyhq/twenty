import { randomUUID } from 'node:crypto';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { resolveWorkspaceMemberAuthContext } from 'test/integration/utils/resolve-workspace-member-auth-context.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { findFieldMetadataIdByName } from 'test/integration/utils/find-field-metadata-id-by-name.util';
import { createApiKeyWithFieldPermission } from 'test/integration/permissions/utils/create-api-key-with-field-permission.util';
import { type ApiKeyWithObjectRecordGrants } from 'test/integration/permissions/utils/create-api-key-with-object-record-grants.util';
import { deleteApiKeysWithObjectRecordGrants } from 'test/integration/permissions/utils/delete-api-keys-with-object-record-grants.util';

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
    question: 'canReadAllRecords' | 'canReadSomeRecords';
    authContext: PermissionsAuthContext;
  }): Promise<boolean> =>
    permissionsService[question]({
      principals: await permissionsService.buildPermissionsPrincipals({
        authContext,
      }),
      objectMetadataId: personFlatObjectMetadata.id,
    });

  const askRecordsQuestion = async ({
    question = 'canReadRecords',
    authContext,
    recordIds,
  }: {
    question?: 'canReadRecords' | 'canUpdateRecords';
    authContext: PermissionsAuthContext;
    recordIds: string[];
  }): Promise<boolean> =>
    permissionsService[question]({
      principals: await permissionsService.buildPermissionsPrincipals({
        authContext,
      }),
      objectMetadataId: personFlatObjectMetadata.id,
      recordIds,
    });

  describe('canReadRecords and canUpdateRecords', () => {
    it('grants a role reading and updating an existing record it grants', async () => {
      expect(
        await askRecordsQuestion({
          authContext: adminAuthContext,
          recordIds: [recordId],
        }),
      ).toBe(true);
      expect(
        await askRecordsQuestion({
          authContext: adminAuthContext,
          recordIds: [recordId],
          question: 'canUpdateRecords',
        }),
      ).toBe(true);
    });

    it('denies an API key without a role', async () => {
      expect(
        await askRecordsQuestion({
          authContext: missingRoleAuthContext,
          recordIds: [recordId],
        }),
      ).toBe(false);
    });

    it('denies when one of the records does not exist', async () => {
      expect(
        await askRecordsQuestion({
          authContext: adminAuthContext,
          recordIds: [recordId, randomUUID()],
        }),
      ).toBe(false);
    });
  });

  describe('findReadableRecordIds', () => {
    it('keeps only the records the principal can read', async () => {
      expect(
        await permissionsService.findReadableRecordIds({
          principals: await permissionsService.buildPermissionsPrincipals({
            authContext: adminAuthContext,
          }),
          objectMetadataId: personFlatObjectMetadata.id,
          recordIds: [recordId, randomUUID()],
        }),
      ).toEqual([recordId]);
    });
  });

  describe.each(['canReadAllRecords', 'canReadSomeRecords'] as const)(
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
  describe('field questions', () => {
    let readRestricted: ApiKeyWithObjectRecordGrants;
    let updateRestricted: ApiKeyWithObjectRecordGrants;
    let introFieldMetadataId: string;
    let jobTitleFieldMetadataId: string;

    beforeAll(async () => {
      [readRestricted, updateRestricted] = await Promise.all([
        createApiKeyWithFieldPermission({
          objectNameSingular: 'person',
          fieldName: 'intro',
          canReadFieldValue: false,
        }),
        createApiKeyWithFieldPermission({
          objectNameSingular: 'person',
          fieldName: 'intro',
          canUpdateFieldValue: false,
        }),
      ]);
      [introFieldMetadataId, jobTitleFieldMetadataId] = await Promise.all(
        ['intro', 'jobTitle'].map((fieldName) =>
          findFieldMetadataIdByName({
            objectMetadataId: personFlatObjectMetadata.id,
            fieldName,
          }),
        ),
      );
    });

    afterAll(async () => {
      await deleteApiKeysWithObjectRecordGrants([
        readRestricted,
        updateRestricted,
      ]);
    });

    const buildApiKeyPrincipals = async (
      apiKey: Pick<ApiKeyWithObjectRecordGrants, 'apiKeyId'>,
    ) => {
      const principals = await permissionsService.buildPermissionsPrincipals({
        authContext: {
          type: 'apiKey',
          workspace: { id: SEED_APPLE_WORKSPACE_ID },
          apiKey: { id: apiKey.apiKeyId },
        },
      });

      if (!isDefined(principals)) {
        throw new Error('Expected the API key to hold a role');
      }

      return principals;
    };

    it('hides a field the role cannot read from reads and updates', async () => {
      const principals = await buildApiKeyPrincipals(readRestricted);
      const question = {
        principals,
        objectMetadataId: personFlatObjectMetadata.id,
        fieldMetadataId: introFieldMetadataId,
      };

      expect(await permissionsService.canReadField(question)).toBe(false);
      expect(await permissionsService.canUpdateField(question)).toBe(false);

      const unreadableFieldMetadataIds =
        await permissionsService.findUnreadableFieldMetadataIdsOrThrow({
          principals,
          objectMetadataId: personFlatObjectMetadata.id,
        });

      expect(unreadableFieldMetadataIds).toContain(introFieldMetadataId);
      expect(unreadableFieldMetadataIds).not.toContain(jobTitleFieldMetadataId);
      expect(
        await permissionsService.findNonUpdatableFieldMetadataIdsOrThrow({
          principals,
          objectMetadataId: personFlatObjectMetadata.id,
        }),
      ).toContain(introFieldMetadataId);
    });

    it('keeps a read-only field readable but not updatable', async () => {
      const principals = await buildApiKeyPrincipals(updateRestricted);
      const question = {
        principals,
        objectMetadataId: personFlatObjectMetadata.id,
        fieldMetadataId: introFieldMetadataId,
      };

      expect(await permissionsService.canReadField(question)).toBe(true);
      expect(await permissionsService.canUpdateField(question)).toBe(false);

      const objectQuestion = {
        principals,
        objectMetadataId: personFlatObjectMetadata.id,
      };
      const nonUpdatableFieldMetadataIds =
        await permissionsService.findNonUpdatableFieldMetadataIdsOrThrow(
          objectQuestion,
        );

      expect(nonUpdatableFieldMetadataIds).toContain(introFieldMetadataId);
      expect(nonUpdatableFieldMetadataIds).not.toContain(
        jobTitleFieldMetadataId,
      );
      expect(
        await permissionsService.findUnreadableFieldMetadataIdsOrThrow(
          objectQuestion,
        ),
      ).not.toContain(introFieldMetadataId);
    });

    it('denies every field to an API key with no role', async () => {
      const question = {
        principals: await permissionsService.buildPermissionsPrincipals({
          authContext: missingRoleAuthContext,
        }),
        objectMetadataId: personFlatObjectMetadata.id,
        fieldMetadataId: jobTitleFieldMetadataId,
      };

      expect(await permissionsService.canReadField(question)).toBe(false);
      expect(await permissionsService.canUpdateField(question)).toBe(false);
    });

    it('denies a field the object does not have', async () => {
      expect(
        await permissionsService.canReadField({
          principals: await buildApiKeyPrincipals(updateRestricted),
          objectMetadataId: personFlatObjectMetadata.id,
          fieldMetadataId: randomUUID(),
        }),
      ).toBe(false);
    });
  });
});
