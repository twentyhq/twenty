import {
  FeatureFlagKey,
  type ObjectRecordsPermissions,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';
import { isListingThroughRecordAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-listing-through-record-access-groups.util';
import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';

const ROLE_ID = 'role-id';
const flatObjectMetadata = getFlatObjectMetadataMock({
  id: 'person',
  universalIdentifier: 'person',
  nameSingular: 'person',
  namePlural: 'people',
});

const allRecords: ObjectRecordsPermissions = {
  canCreateAllRecords: true,
  canReadAllRecords: true,
  canUpdateAllRecords: true,
  canSoftDeleteAllRecords: true,
  canDestroyAllRecords: true,
  restrictedFields: {},
};

const withRule: ObjectRecordsPermissions = {
  ...allRecords,
  canReadAllRecords: false,
  rowLevelRecordsPermissions: {
    canCreateRecords: false,
    canReadRecords: true,
    canUpdateRecords: false,
    canSoftDeleteRecords: false,
    canDestroyRecords: false,
    predicates: [],
    predicateGroups: [],
  },
};

const buildRequest = ({
  objectRecordsPermissions,
  isAccessGroupsEnabled = true,
  operationType = 'read',
}: {
  objectRecordsPermissions: ObjectRecordsPermissions;
  isAccessGroupsEnabled?: boolean;
  operationType?: PermissionsObjectAccessRequest['operationType'];
}): PermissionsObjectAccessRequest => ({
  principals: {
    workspaceId: 'workspace-id',
    mainPrincipal: {
      type: 'workspaceMember',
      roleId: ROLE_ID,
      workspaceMemberId: 'member-id',
    },
    applicationPrincipal: { type: 'customApplication' },
  },
  metadataMaps: {
    flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
    flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
    flatRowLevelPermissionPredicateMaps: createEmptyFlatEntityMaps(),
    flatRowLevelPermissionPredicateGroupMaps: createEmptyFlatEntityMaps(),
    flatApplicationMaps: { byId: {} },
    featureFlagsMap: {
      [FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED]: isAccessGroupsEnabled,
    },
    rolesPermissions: {
      [ROLE_ID]: {
        ...NO_ROLE_RECORDS_PERMISSIONS,
        objects: { [flatObjectMetadata.id]: objectRecordsPermissions },
      },
    },
  },
  flatObjectMetadata,
  operationType,
});

describe('isListingThroughRecordAccessGroups', () => {
  it('should list through access groups when the main role has a rule on the object', () => {
    expect(
      isListingThroughRecordAccessGroups(
        buildRequest({ objectRecordsPermissions: withRule }),
      ),
    ).toBe(true);
  });

  it.each([
    ['the flag is off', { isAccessGroupsEnabled: false }],
    ['the operation is not a read', { operationType: 'update' as const }],
  ])('should keep the rule when %s', (_, overrides) => {
    expect(
      isListingThroughRecordAccessGroups(
        buildRequest({ objectRecordsPermissions: withRule, ...overrides }),
      ),
    ).toBe(false);
  });

  it('should keep the rule when the main role reads every record', () => {
    expect(
      isListingThroughRecordAccessGroups(
        buildRequest({ objectRecordsPermissions: allRecords }),
      ),
    ).toBe(false);
  });

  it('should keep the rule when an application role also has a rule on the object', () => {
    const request = buildRequest({ objectRecordsPermissions: withRule });

    expect(
      isListingThroughRecordAccessGroups({
        ...request,
        principals: {
          ...request.principals,
          applicationPrincipal: {
            type: 'application',
            roleId: 'application-role-id',
            applicationId: 'application-id',
          },
        },
        metadataMaps: {
          ...request.metadataMaps,
          rolesPermissions: {
            ...request.metadataMaps.rolesPermissions,
            'application-role-id': {
              ...NO_ROLE_RECORDS_PERMISSIONS,
              objects: { [flatObjectMetadata.id]: withRule },
            },
          },
        },
      }),
    ).toBe(false);
  });
});
