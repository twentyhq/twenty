/* @license Enterprise */

import {
  FeatureFlagKey,
  type ObjectPermissions,
  RecordShareAccessLevel,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { type PermissionsRowAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { resolvePermissionsRowAccessOutcome } from 'src/engine/permissions/combine/utils/resolve-permissions-row-access-outcome.util';
import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import { type OperationType } from 'src/engine/permissions/role/utils/validate-operation-is-permitted-or-throw.util';

const APPLICATION_ID = 'application-id';
const APPLICATION_ROLE_ID = 'application-role';
const READ_ONLY_ROLE_ID = 'read-only-role';

const flatObjectMetadata = {
  ...COMPANY_FLAT_OBJECT_MOCK,
  isSystem: false,
  applicationId: APPLICATION_ID,
};

const readOnlyPermissions: ObjectPermissions = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};

const readOnlyPrincipal: PermissionsPrincipal = {
  workspaceId: 'workspace-id',
  intersectionOf: { userWorkspaceRoleId: READ_ONLY_ROLE_ID },
};

const owningApplicationPrincipal: PermissionsPrincipal = {
  workspaceId: 'workspace-id',
  intersectionOf: { applicationRoleId: APPLICATION_ROLE_ID },
};

const resolveOutcome = ({
  principal = readOnlyPrincipal,
  operationType = 'select',
  featureFlagKeys = [],
  disabledObjectPermissionActions = [],
  hypotheticalRecordShareAccessLevel,
}: {
  principal?: PermissionsPrincipal;
  operationType?: OperationType;
  featureFlagKeys?: FeatureFlagKey[];
  disabledObjectPermissionActions?: typeof flatObjectMetadata.disabledObjectPermissionActions;
  hypotheticalRecordShareAccessLevel?: PermissionsRowAccessRequest['hypotheticalRecordShareAccessLevel'];
}) =>
  resolvePermissionsRowAccessOutcome({
    principal,
    metadataMaps: {
      flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
      flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
      rolesPermissions: {
        [READ_ONLY_ROLE_ID]: { [flatObjectMetadata.id]: readOnlyPermissions },
        [APPLICATION_ROLE_ID]: {
          [flatObjectMetadata.id]: readOnlyPermissions,
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
        principal: {
          ...readOnlyPrincipal,
          intersectionOf: { userWorkspaceRoleId: 'missing-role' },
        },
      }),
    ).toBe(false);
    expect(
      resolveOutcome({
        operationType: 'delete',
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
        principal: owningApplicationPrincipal,
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
});
