/* @license Enterprise */

import {
  FeatureFlagKey,
  type ObjectRecordsPermissions,
  RecordShareAccessLevel,
  type ObjectRecordsOperationType,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { type PermissionsRowAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { resolvePermissionsRowAccessOutcome } from 'src/engine/permissions/internal/combine/utils/resolve-permissions-row-access-outcome.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';

const APPLICATION_ID = 'application-id';
const APPLICATION_ROLE_ID = 'application-role';
const READ_ONLY_ROLE_ID = 'read-only-role';

const flatObjectMetadata = {
  ...COMPANY_FLAT_OBJECT_MOCK,
  isSystem: false,
  applicationId: APPLICATION_ID,
};

const readOnlyPermissions: ObjectRecordsPermissions = {
  canCreateAllRecords: false,
  canReadAllRecords: true,
  canUpdateAllRecords: false,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: false,
  restrictedFields: {},
};

const readOnlyPrincipals: PermissionsPrincipalsWithRolesContext = {
  workspaceId: 'workspace-id',
  mainPrincipal: { type: 'role', roleId: READ_ONLY_ROLE_ID },
  applicationPrincipal: { type: 'customApplication' },
};

const owningApplicationPrincipals: PermissionsPrincipalsWithRolesContext = {
  workspaceId: 'workspace-id',
  mainPrincipal: {
    type: 'application',
    roleId: APPLICATION_ROLE_ID,
    applicationId: APPLICATION_ID,
  },
  applicationPrincipal: {
    type: 'application',
    roleId: APPLICATION_ROLE_ID,
    applicationId: APPLICATION_ID,
  },
};

const resolveOutcome = ({
  principals = readOnlyPrincipals,
  operationType = 'read',
  featureFlagKeys = [],
  disabledObjectPermissionActions = [],
  hypotheticalRecordShareAccessLevel,
}: {
  principals?: PermissionsPrincipalsWithRolesContext;
  operationType?: ObjectRecordsOperationType;
  featureFlagKeys?: FeatureFlagKey[];
  disabledObjectPermissionActions?: typeof flatObjectMetadata.disabledObjectPermissionActions;
  hypotheticalRecordShareAccessLevel?: PermissionsRowAccessRequest['hypotheticalRecordShareAccessLevel'];
}) =>
  resolvePermissionsRowAccessOutcome({
    principals,
    metadataMaps: {
      flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
      flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
      rolesPermissions: {
        [READ_ONLY_ROLE_ID]: {
          ...NO_ROLE_RECORDS_PERMISSIONS,
          objects: { [flatObjectMetadata.id]: readOnlyPermissions },
        },
        [APPLICATION_ROLE_ID]: {
          ...NO_ROLE_RECORDS_PERMISSIONS,
          objects: { [flatObjectMetadata.id]: readOnlyPermissions },
        },
      },
      flatApplicationMaps: {
        byId: {
          [APPLICATION_ID]: {
            id: APPLICATION_ID,
            defaultRoleId: APPLICATION_ROLE_ID,
            deletedAt: null,
          },
        },
      },
      flatRowLevelPermissionPredicateMaps: createEmptyFlatEntityMaps(),
      flatRowLevelPermissionPredicateGroupMaps: createEmptyFlatEntityMaps(),
      featureFlagsMap: Object.fromEntries(
        featureFlagKeys.map((featureFlagKey) => [featureFlagKey, true]),
      ),
    },
    flatObjectMetadata: {
      ...flatObjectMetadata,
      disabledObjectPermissionActions,
    },
    operationType,
    hypotheticalRecordShareAccessLevel,
  });

describe('resolvePermissionsRowAccessOutcome', () => {
  it('leaves a permitted operation to the grant paths', () => {
    expect(resolveOutcome({})).toBeUndefined();
  });

  it('denies an operation the role lacks when no share can grant it', () => {
    expect(resolveOutcome({ operationType: 'update' })).toBe(false);
    expect(
      resolveOutcome({
        principals: {
          ...readOnlyPrincipals,
          mainPrincipal: { type: 'role', roleId: 'missing-role' },
          applicationPrincipal: { type: 'customApplication' },
        },
      }),
    ).toBe(false);
    expect(
      resolveOutcome({
        operationType: 'destroy',
        featureFlagKeys: [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED],
      }),
    ).toBe(false);
  });

  it('denies a disabled operation unless the principal owns the object', () => {
    expect(
      resolveOutcome({
        disabledObjectPermissionActions: ['canReadObjectRecords'],
      }),
    ).toBe(false);
    expect(
      resolveOutcome({
        principals: owningApplicationPrincipals,
        disabledObjectPermissionActions: ['canReadObjectRecords'],
      }),
    ).toBeUndefined();
  });

  it('leaves an operation shares can grant beyond the role to the paths, and opens it for a hypothetical share', () => {
    expect(
      resolveOutcome({
        operationType: 'update',
        featureFlagKeys: [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED],
      }),
    ).toBeUndefined();
    expect(
      resolveOutcome({
        operationType: 'update',
        featureFlagKeys: [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED],
        hypotheticalRecordShareAccessLevel: RecordShareAccessLevel.READ_WRITE,
      }),
    ).toBe(true);
  });

  describe('for a principal narrowed by a scope', () => {
    const scopedPrincipals = ({
      canReadObjectRecords,
    }: {
      canReadObjectRecords: boolean;
    }): PermissionsPrincipalsWithRolesContext => ({
      ...readOnlyPrincipals,
      aiRunScope: {
        recordsPermissions: {
          ...NO_ROLE_RECORDS_PERMISSIONS,
          objects: {
            [flatObjectMetadata.id]: {
              ...readOnlyPermissions,
              canReadAllRecords: canReadObjectRecords,
            },
          },
        },
        permissionFlags: {},
      },
    });

    it('denies what the scope denies, though the role permits it', () => {
      expect(
        resolveOutcome({
          principals: scopedPrincipals({ canReadObjectRecords: false }),
        }),
      ).toBe(false);
      expect(
        resolveOutcome({
          principals: scopedPrincipals({ canReadObjectRecords: true }),
        }),
      ).toBeUndefined();
    });

    it('never lets a share carry it beyond its roles', () => {
      const principals = scopedPrincipals({ canReadObjectRecords: true });
      const featureFlagKeys = [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED];

      expect(
        resolveOutcome({
          principals,
          operationType: 'update',
          featureFlagKeys,
        }),
      ).toBe(false);
      expect(
        resolveOutcome({
          principals,
          operationType: 'update',
          featureFlagKeys,
          hypotheticalRecordShareAccessLevel: RecordShareAccessLevel.READ_WRITE,
        }),
      ).toBe(false);
    });
  });
});
