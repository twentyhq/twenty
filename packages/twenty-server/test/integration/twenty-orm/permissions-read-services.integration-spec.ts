import { randomUUID } from 'node:crypto';

import { PermissionFlagType } from 'twenty-shared/constants';
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
import { type PrincipalPermissionsService } from 'src/engine/permissions/principal-permissions.service';
import { type RecordPermissionsService } from 'src/engine/permissions/record-permissions.service';
import { type RolePermissionsService } from 'src/engine/permissions/role-permissions.service';
import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import { type SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('permissions read services', () => {
  const recordId = randomUUID();
  let adminAuthContext: PermissionsAuthContext;
  let personFlatObjectMetadata: FlatObjectMetadata;
  let principalPermissionsService: PrincipalPermissionsService;
  let recordPermissionsService: RecordPermissionsService;
  let rolePermissionsService: RolePermissionsService;
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
    principalPermissionsService =
      getAppProviderByClassName<PrincipalPermissionsService>(
        'PrincipalPermissionsService',
      );
    recordPermissionsService =
      getAppProviderByClassName<RecordPermissionsService>(
        'RecordPermissionsService',
      );
    rolePermissionsService = getAppProviderByClassName<RolePermissionsService>(
      'RolePermissionsService',
    );

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

  const askCanReadSomeRecords = async ({
    authContext,
  }: {
    authContext: PermissionsAuthContext;
  }): Promise<boolean> =>
    recordPermissionsService.canAccessSomeRecords({
      operationType: 'read',
      principals:
        await principalPermissionsService.resolvePermissionsPrincipals({
          authContext,
        }),
      objectMetadataId: personFlatObjectMetadata.id,
    });

  const askRecordsQuestion = async ({
    operationType = 'read',
    authContext,
    recordIds,
  }: {
    operationType?: 'read' | 'update';
    authContext: PermissionsAuthContext;
    recordIds: string[];
  }): Promise<boolean> =>
    recordPermissionsService.canAccessKnownRecords({
      operationType,
      principals:
        await principalPermissionsService.resolvePermissionsPrincipals({
          authContext,
        }),
      objectMetadataId: personFlatObjectMetadata.id,
      recordIds,
    });

  describe('permission flags of a named subject', () => {
    const buildSettingPermissionsService = () =>
      getAppProviderByClassName<SettingPermissionsService>(
        'SettingPermissionsService',
      );

    it('answers for a user workspace like the check on its auth context', async () => {
      const janeAuthContext = await resolveWorkspaceMemberAuthContext({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      });
      const settingPermissionsService = buildSettingPermissionsService();

      expect(
        await settingPermissionsService.userWorkspaceHasPermissionFlag({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          userWorkspaceId: janeAuthContext.userWorkspaceId,
          permissionFlag: PermissionFlagType.WORKSPACE,
        }),
      ).toBe(
        await settingPermissionsService.hasPermissionFlag({
          authContext: janeAuthContext,
          permissionFlag: PermissionFlagType.WORKSPACE,
        }),
      );
    });

    it('denies a user workspace with no role', async () => {
      expect(
        await buildSettingPermissionsService().userWorkspaceHasPermissionFlag({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          userWorkspaceId: randomUUID(),
          permissionFlag: PermissionFlagType.WORKSPACE,
        }),
      ).toBe(false);
    });

    it('denies an application that does not exist', async () => {
      expect(
        await buildSettingPermissionsService().applicationHasPermissionFlag({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          applicationId: randomUUID(),
          permissionFlag: PermissionFlagType.WORKSPACE,
        }),
      ).toBe(false);
    });
  });

  describe('canAccessKnownRecords', () => {
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
          operationType: 'update',
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

  describe('canAccessSomeRecords', () => {
    it('follows the role when it permits the operation', async () => {
      expect(
        await askCanReadSomeRecords({
          authContext: adminAuthContext,
        }),
      ).toBe(true);
    });

    it('denies an API key with no role', async () => {
      expect(
        await askCanReadSomeRecords({
          authContext: missingRoleAuthContext,
        }),
      ).toBe(false);
    });
  });

  describe('role questions', () => {
    it('finds the roles of a principal', async () => {
      expect(
        await rolePermissionsService.findRoleIds({
          authContext: adminAuthContext,
        }),
      ).not.toHaveLength(0);
    });

    it('finds no role for an API key without one', async () => {
      expect(
        await rolePermissionsService.findRoleIds({
          authContext: missingRoleAuthContext,
        }),
      ).toEqual([]);
    });
  });

  describe('field questions', () => {
    let readRestricted: ApiKeyWithObjectRecordGrants;
    let updateRestricted: ApiKeyWithObjectRecordGrants;
    let idReadRestricted: ApiKeyWithObjectRecordGrants;
    let introFieldMetadataId: string;
    let jobTitleFieldMetadataId: string;

    beforeAll(async () => {
      [readRestricted, updateRestricted, idReadRestricted] = await Promise.all([
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
        createApiKeyWithFieldPermission({
          objectNameSingular: 'person',
          fieldName: 'id',
          canReadFieldValue: false,
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
        idReadRestricted,
      ]);
    });

    const buildApiKeyPrincipals = async (
      apiKey: Pick<ApiKeyWithObjectRecordGrants, 'apiKeyId'>,
    ) => {
      const principals =
        await principalPermissionsService.resolvePermissionsPrincipals({
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

    it('denies record questions when the role cannot read the id field', async () => {
      const buildApiKeyAuthContext = (
        apiKey: ApiKeyWithObjectRecordGrants,
      ): PermissionsAuthContext => ({
        type: 'apiKey',
        workspace: { id: SEED_APPLE_WORKSPACE_ID },
        apiKey: { id: apiKey.apiKeyId },
      });

      for (const operationType of ['read', 'update'] as const) {
        expect(
          await askRecordsQuestion({
            operationType,
            authContext: buildApiKeyAuthContext(readRestricted),
            recordIds: [recordId],
          }),
        ).toBe(true);
        expect(
          await askRecordsQuestion({
            operationType,
            authContext: buildApiKeyAuthContext(idReadRestricted),
            recordIds: [recordId],
          }),
        ).toBe(false);
      }
    });

    it('hides a field the role cannot read from reads and updates', async () => {
      const principals = await buildApiKeyPrincipals(readRestricted);
      const unreadableFieldMetadataIds =
        await recordPermissionsService.findUnreadableFields({
          principals,
          objectMetadataId: personFlatObjectMetadata.id,
        });

      expect(unreadableFieldMetadataIds).toContain(introFieldMetadataId);
      expect(unreadableFieldMetadataIds).not.toContain(jobTitleFieldMetadataId);
      expect(
        await recordPermissionsService.findUneditableFields({
          principals,
          objectMetadataId: personFlatObjectMetadata.id,
        }),
      ).toContain(introFieldMetadataId);
    });

    it('keeps a read-only field readable but not updatable', async () => {
      const principals = await buildApiKeyPrincipals(updateRestricted);
      const objectQuestion = {
        principals,
        objectMetadataId: personFlatObjectMetadata.id,
      };
      const nonUpdatableFieldMetadataIds =
        await recordPermissionsService.findUneditableFields(objectQuestion);

      expect(nonUpdatableFieldMetadataIds).toContain(introFieldMetadataId);
      expect(nonUpdatableFieldMetadataIds).not.toContain(
        jobTitleFieldMetadataId,
      );
      expect(
        await recordPermissionsService.findUnreadableFields(objectQuestion),
      ).not.toContain(introFieldMetadataId);
    });
  });
});
