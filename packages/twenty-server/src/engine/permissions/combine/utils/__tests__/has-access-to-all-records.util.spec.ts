/* @license Enterprise */

import { type ObjectPermissions } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { hasAccessToAllRecords } from 'src/engine/permissions/combine/utils/has-access-to-all-records.util';
import { resolveRowLevelPermissionRecordFilter } from 'src/engine/permissions/rls/utils/resolve-row-level-permission-record-filter.util';
import { type OperationType } from 'src/engine/permissions/role/utils/validate-operation-is-permitted-or-throw.util';

jest.mock(
  'src/engine/permissions/rls/utils/resolve-row-level-permission-record-filter.util',
);

const APPLICATION_ID = 'application-id';
const APPLICATION_ROLE_ID = 'application-role';
const READ_ONLY_ROLE_ID = 'read-only-role';
const OTHER_APPLICATION_ROLE_ID = 'other-application-role';
const APPLICATION_ID_BY_ROLE_ID: Record<string, string> = {
  [APPLICATION_ROLE_ID]: APPLICATION_ID,
  [OTHER_APPLICATION_ROLE_ID]: 'other-application-id',
};

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

const hasAccess = ({
  roleId = READ_ONLY_ROLE_ID,
  operationType = 'select',
  disabledObjectPermissionActions = [],
}: {
  roleId?: string;
  operationType?: OperationType;
  disabledObjectPermissionActions?: typeof flatObjectMetadata.disabledObjectPermissionActions;
}) => {
  const request: PermissionsObjectAccessRequest = {
    principal: {
      workspaceId: 'workspace-id',
      roleIds: [roleId],
      applicationId: APPLICATION_ID_BY_ROLE_ID[roleId],
    },
    metadataMaps: {
      flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
      flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
      rolesPermissions: {
        [READ_ONLY_ROLE_ID]: { [flatObjectMetadata.id]: readOnlyPermissions },
        [APPLICATION_ROLE_ID]: {
          [flatObjectMetadata.id]: readOnlyPermissions,
        },
        [OTHER_APPLICATION_ROLE_ID]: {
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
          'other-application-id': {
            id: 'other-application-id',
            defaultRoleId: OTHER_APPLICATION_ROLE_ID,
            deletedAt: null,
          },
        },
      },
      flatRowLevelPermissionPredicateMaps: createEmptyFlatEntityMaps(),
      flatRowLevelPermissionPredicateGroupMaps: createEmptyFlatEntityMaps(),
      featureFlagsMap: {},
    },
    flatObjectMetadata: {
      ...flatObjectMetadata,
      disabledObjectPermissionActions,
    },
    operationType,
  };

  return hasAccessToAllRecords(request);
};

describe('hasAccessToAllRecords', () => {
  beforeEach(() => {
    jest.mocked(resolveRowLevelPermissionRecordFilter).mockReturnValue(null);
  });

  it('follows the role on an object without row filter', () => {
    expect(hasAccess({})).toBe(true);
    expect(hasAccess({ operationType: 'update' })).toBe(false);
    expect(hasAccess({ roleId: 'missing-role' })).toBe(false);
  });

  it('denies once a row filter limits the role', () => {
    jest
      .mocked(resolveRowLevelPermissionRecordFilter)
      .mockReturnValue({ status: { eq: 'active' } });

    expect(hasAccess({})).toBe(false);
  });

  it('denies a disabled operation unless the principal owns the object', () => {
    expect(
      hasAccess({ disabledObjectPermissionActions: ['canReadObjectRecords'] }),
    ).toBe(false);
    expect(
      hasAccess({
        roleId: APPLICATION_ROLE_ID,
        disabledObjectPermissionActions: ['canReadObjectRecords'],
      }),
    ).toBe(true);
    expect(
      hasAccess({
        roleId: OTHER_APPLICATION_ROLE_ID,
        disabledObjectPermissionActions: ['canReadObjectRecords'],
      }),
    ).toBe(false);
  });
});
