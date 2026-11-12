import { findWorkspaceCustomApplicationId } from 'test/integration/metadata/suites/application-default-role/utils/find-application-default-role.util';
import { createUpsertObjectPermissionsOperation } from 'test/integration/graphql/utils/upsert-object-permission-operation-factory.util';
import {
  findApplicationDefaultRoleId,
  findApplicationGrantRole,
  findApplicationIdByUniversalIdentifier,
  findRolePermissionSnapshot,
} from 'test/integration/metadata/suites/application-grant-role/utils/find-application-grant-role.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { updateOneRole } from 'test/integration/metadata/suites/role/utils/update-one-role.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import {
  type FieldManifest,
  type RoleManifest,
} from 'twenty-shared/application';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const APPLICATION_UNIVERSAL_IDENTIFIER = uuidv4();
const ROLE_UNIVERSAL_IDENTIFIER = uuidv4();
const FIELD_UNIVERSAL_IDENTIFIER = uuidv4();
const PREDICATE_UNIVERSAL_IDENTIFIER = uuidv4();

const PERSON_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.universalIdentifier;

const scopingFieldManifest: FieldManifest = {
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  type: FieldMetadataType.TEXT,
  name: 'grantScopingColumn',
  label: 'Grant Scoping Column',
  description: 'Custom field the requested role restricts',
  icon: 'IconLock',
  objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
};

const INITIAL_REQUESTED_ROLE: RoleManifest = {
  universalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Grant test requested role',
  canAccessAllTools: false,
  permissionFlagUniversalIdentifiers: [SystemPermissionFlag.VIEWS],
  objectPermissions: [
    {
      objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
    },
  ],
  fieldPermissions: [
    {
      objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      canUpdateFieldValue: false,
    },
  ],
  rowLevelPermissionPredicates: [
    {
      universalIdentifier: PREDICATE_UNIVERSAL_IDENTIFIER,
      objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      operand: RowLevelPermissionPredicateOperand.CONTAINS,
      value: 'shared',
    },
  ],
};

const CHANGED_REQUESTED_ROLE: RoleManifest = {
  ...INITIAL_REQUESTED_ROLE,
  canAccessAllTools: true,
  permissionFlagUniversalIdentifiers: [],
  objectPermissions: [
    {
      objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
    },
  ],
  fieldPermissions: [],
  rowLevelPermissionPredicates: [
    {
      universalIdentifier: PREDICATE_UNIVERSAL_IDENTIFIER,
      objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      operand: RowLevelPermissionPredicateOperand.DOES_NOT_CONTAIN,
      value: 'private',
    },
  ],
};

const syncRequestedRole = async (requestedRole: RoleManifest) => {
  const { errors } = await syncApplication({
    manifest: buildBaseManifest({
      appId: APPLICATION_UNIVERSAL_IDENTIFIER,
      roleId: ROLE_UNIVERSAL_IDENTIFIER,
      overrides: { fields: [scopingFieldManifest], roles: [requestedRole] },
    }),
    expectToFail: false,
  });

  expect(errors).toBeUndefined();
};

const findUpsertedApplicationGrantRole = async () => {
  const applicationId = await findApplicationIdByUniversalIdentifier({
    universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  });

  if (applicationId === undefined) {
    throw new Error('Synced application not found');
  }

  return {
    applicationId,
    grant: await findApplicationGrantRole({
      applicationId,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    }),
  };
};

describe('Application grant on dev sync', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      name: 'Grant Dev Sync',
      description: 'App for testing application grants on dev sync',
      sourcePath: 'test-application-grant-dev-sync',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });
  });

  it('creates a grant owned by the workspace custom application, equal to the requested role without its RLS', async () => {
    await syncRequestedRole(INITIAL_REQUESTED_ROLE);

    const { applicationId, grant } = await findUpsertedApplicationGrantRole();
    const workspaceCustomApplicationId =
      await findWorkspaceCustomApplicationId();
    const requestedRoleId = await findApplicationDefaultRoleId({
      applicationId: applicationId,
    });

    expect(grant).toBeDefined();
    expect(grant?.role).toMatchObject({
      label: 'Test Application role',
      applicationId: workspaceCustomApplicationId,
      isEditable: false,
      canBeAssignedToUsers: false,
      canBeAssignedToApiKeys: false,
      canBeAssignedToAgents: false,
      canBeAssignedToApplications: true,
    });
    expect(grant?.role.id).not.toBe(requestedRoleId);
    expect(grant?.roleTarget.applicationId).toBe(workspaceCustomApplicationId);

    const grantSnapshot = await findRolePermissionSnapshot(grant!.role.id);

    const requestedSnapshot = await findRolePermissionSnapshot(requestedRoleId);

    expect(requestedSnapshot.rowLevelPermissionPredicates).toHaveLength(1);
    expect(grantSnapshot).toEqual({
      ...requestedSnapshot,
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    });
    expect(grantSnapshot.objectPermissions).toHaveLength(1);
    expect(grantSnapshot.fieldPermissions).toHaveLength(1);
    expect(grantSnapshot.permissionFlags).toHaveLength(1);
  }, 60000);

  it('rewrites the same grant when the requested role changes', async () => {
    await syncRequestedRole(INITIAL_REQUESTED_ROLE);

    const { grant: initialGrant } = await findUpsertedApplicationGrantRole();

    await syncRequestedRole(CHANGED_REQUESTED_ROLE);

    const { applicationId, grant } = await findUpsertedApplicationGrantRole();
    const requestedRoleId = await findApplicationDefaultRoleId({
      applicationId: applicationId,
    });

    expect(grant?.role.id).toBe(initialGrant?.role.id);
    expect(grant?.roleTarget.id).toBe(initialGrant?.roleTarget.id);

    const grantSnapshot = await findRolePermissionSnapshot(grant!.role.id);

    expect(grantSnapshot).toEqual({
      ...(await findRolePermissionSnapshot(requestedRoleId)),
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    });
    expect(grantSnapshot.switches.canAccessAllTools).toBe(true);
    expect(grantSnapshot.fieldPermissions).toEqual([]);
    expect(grantSnapshot.permissionFlags).toEqual([]);
  }, 60000);

  it('removes the grant role, its target and its permissions on uninstall', async () => {
    await syncRequestedRole(INITIAL_REQUESTED_ROLE);

    const { grant } = await findUpsertedApplicationGrantRole();

    const { errors } = await uninstallApplication({
      universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const remainingRows = await globalThis.testDataSource.query(
      `SELECT id FROM core."role" WHERE id = $1
       UNION ALL
       SELECT id FROM core."roleTarget" WHERE id = $2
       UNION ALL
       SELECT id FROM core."objectPermission" WHERE "roleId" = $1
       UNION ALL
       SELECT id FROM core."fieldPermission" WHERE "roleId" = $1
       UNION ALL
       SELECT id FROM core."rolePermissionFlag" WHERE "roleId" = $1
       UNION ALL
       SELECT id FROM core."rowLevelPermissionPredicate" WHERE "roleId" = $1`,
      [grant!.role.id, grant!.roleTarget.id],
    );

    expect(remainingRows).toEqual([]);
  }, 60000);

  describe('through the regular role APIs', () => {
    let grantRoleId: string;

    beforeEach(async () => {
      await syncRequestedRole(INITIAL_REQUESTED_ROLE);

      const { grant } = await findUpsertedApplicationGrantRole();

      grantRoleId = grant!.role.id;
    }, 60000);

    it('cannot update the grant role', async () => {
      const { errors } = await updateOneRole({
        input: {
          idToUpdate: grantRoleId,
          updatePayload: { canDestroyAllObjectRecords: true },
        },
        expectToFail: true,
      });

      expect(errors).toBeDefined();
    });

    it('cannot change the grant object permissions', async () => {
      const [{ objectMetadataId }] = await globalThis.testDataSource.query(
        `SELECT "objectMetadataId" FROM core."objectPermission" WHERE "roleId" = $1`,
        [grantRoleId],
      );

      const response = await makeMetadataApiRequest(
        createUpsertObjectPermissionsOperation(grantRoleId, [
          { objectMetadataId, canDestroyObjectRecords: true },
        ]),
      );

      expect(response.body.errors).toBeDefined();
    });

    it('cannot delete the grant role', async () => {
      const { errors } = await deleteOneRole({
        input: { idToDelete: grantRoleId },
        expectToFail: true,
      });

      expect(errors).toBeDefined();
    });

    it('cannot assign the grant role to a workspace member', async () => {
      const { errors } = await updateWorkspaceMemberRole({
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          roleId: grantRoleId,
        },
        expectToFail: true,
      });

      expect(errors).toBeDefined();
    });
  });
});
