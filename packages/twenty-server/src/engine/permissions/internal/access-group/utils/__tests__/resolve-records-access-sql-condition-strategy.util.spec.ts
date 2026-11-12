import {
  FeatureFlagKey,
  type ObjectRecordsPermissions,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';
import { resolveRecordsAccessSQLConditionStrategy } from 'src/engine/permissions/internal/access-group/utils/resolve-records-access-sql-condition-strategy.util';
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
  unreadableFields: [],
  uneditableFields: [],
};

const withRlsRule: ObjectRecordsPermissions = {
  ...allRecords,
  canReadAllRecords: false,
  rowLevelRecordsPermissions: [
    {
      ruleId: 'rule-id',
      canCreateRecords: false,
      canReadRecords: true,
      canUpdateRecords: false,
      canSoftDeleteRecords: false,
      canDestroyRecords: false,
      predicates: [],
      predicateGroups: [],
      unreadableFields: [],
      uneditableFields: [],
    },
  ],
};

const buildRequest = ({
  objectRecordsPermissions,
  isAccessGroupsEnabled = true,
}: {
  objectRecordsPermissions: ObjectRecordsPermissions;
  isAccessGroupsEnabled?: boolean;
}): Pick<
  PermissionsObjectAccessRequest,
  'principals' | 'metadataMaps' | 'flatObjectMetadata'
> => ({
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
});

describe('resolveRecordsAccessSQLConditionStrategy', () => {
  it('should use access groups when the main role has an RLS rule on the object', () => {
    expect(
      resolveRecordsAccessSQLConditionStrategy(
        buildRequest({ objectRecordsPermissions: withRlsRule }),
      ),
    ).toBe('accessGroups');
  });

  it('should stay degraded when the flag is off', () => {
    expect(
      resolveRecordsAccessSQLConditionStrategy(
        buildRequest({
          objectRecordsPermissions: withRlsRule,
          isAccessGroupsEnabled: false,
        }),
      ),
    ).toBe('degradedRead');
  });

  it('should use the condition without RLS when no role has an RLS rule on the object', () => {
    expect(
      resolveRecordsAccessSQLConditionStrategy(
        buildRequest({ objectRecordsPermissions: allRecords }),
      ),
    ).toBe('withoutRowLevelPermissions');
  });

  it('should ignore an RLS rule on an application role', () => {
    const request = buildRequest({ objectRecordsPermissions: withRlsRule });

    expect(
      resolveRecordsAccessSQLConditionStrategy({
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
              objects: { [flatObjectMetadata.id]: withRlsRule },
            },
          },
        },
      }),
    ).toBe('accessGroups');
  });
});
