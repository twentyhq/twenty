import {
  FeatureFlagKey,
  type ObjectRecordsOperationType,
  type ObjectRecordsPermissions,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';
import { buildCallerRelatedRecordPathAccessGroupsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-caller-related-record-path-access-groups-or-throw.util';
import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';
import { resolveRelatedRecordPaths } from 'src/engine/permissions/internal/related-record-path/utils/resolve-related-record-paths.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

jest.mock(
  'src/engine/permissions/internal/related-record-path/utils/resolve-related-record-paths.util',
);

const buildObject = (nameSingular: string): FlatObjectMetadata =>
  getFlatObjectMetadataMock({
    id: nameSingular,
    universalIdentifier: nameSingular,
    nameSingular,
  });

const COMPANY = buildObject('company');
const OPPORTUNITY = buildObject('opportunity');
const ATTACHMENT = buildObject('attachment');

const flatObjectMetadataMaps = [COMPANY, OPPORTUNITY, ATTACHMENT].reduce(
  (flatEntityMaps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
  createEmptyFlatEntityMaps(),
);

const buildPath = ({
  source,
  target,
  isInherent,
}: {
  source: FlatObjectMetadata;
  target: FlatObjectMetadata;
  isInherent: boolean;
}): ResolvedRelatedRecordPath => ({
  isInherent,
  sourceFlatObjectMetadata: source,
  targetObjectMetadataId: target.id,
  hops: [],
});

const READ_ALL_RECORDS: ObjectRecordsPermissions = {
  canCreateAllRecords: false,
  canReadAllRecords: true,
  canUpdateAllRecords: false,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: false,
  unreadableFields: [],
  uneditableFields: [],
};
const READ_THROUGH_RLS_RULE: ObjectRecordsPermissions = {
  ...READ_ALL_RECORDS,
  canReadAllRecords: false,
  rowLevelRecordsPermissions: [],
};

const salesMember: PermissionsPrincipalsWithRolesContext = {
  workspaceId: 'workspace-id',
  mainPrincipal: {
    type: 'workspaceMember',
    roleId: 'sales',
    workspaceMemberId: 'member-id',
  },
  applicationPrincipal: { type: 'customApplication' },
};

const buildCallerAccessGroupObjectMetadataIds = ({
  isCompanyAttachmentsPathInherent = false,
  objectNamesWithRlsRule = ['company'],
  isAccessGroupsEnabled = true,
  operationType = 'read',
  principals = salesMember,
}: {
  isCompanyAttachmentsPathInherent?: boolean;
  objectNamesWithRlsRule?: string[];
  isAccessGroupsEnabled?: boolean;
  operationType?: ObjectRecordsOperationType;
  principals?: PermissionsPrincipalsWithRolesContext;
} = {}) => {
  jest.mocked(resolveRelatedRecordPaths).mockReturnValue([
    buildPath({
      source: COMPANY,
      target: ATTACHMENT,
      isInherent: isCompanyAttachmentsPathInherent,
    }),
    buildPath({ source: OPPORTUNITY, target: COMPANY, isInherent: false }),
  ]);

  return buildCallerRelatedRecordPathAccessGroupsOrThrow({
    request: {
      principals,
      flatObjectMetadata: ATTACHMENT,
      operationType,
      metadataMaps: {
        featureFlagsMap: {
          [FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED]: isAccessGroupsEnabled,
        },
        rolesPermissions: {
          sales: {
            ...NO_ROLE_RECORDS_PERMISSIONS,
            objects: {
              company: READ_ALL_RECORDS,
              opportunity: READ_ALL_RECORDS,
            },
          },
          manager: {
            ...NO_ROLE_RECORDS_PERMISSIONS,
            objects: Object.fromEntries(
              objectNamesWithRlsRule.map((objectName) => [
                objectName,
                READ_THROUGH_RLS_RULE,
              ]),
            ),
          },
        },
        flatObjectMetadataMaps,
        flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
      },
    },
    workspaceMembers: [],
    flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
  }).map(({ objectMetadataId }) => objectMetadataId);
};

const limitedByManagerRole: PermissionsPrincipalsWithRolesContext = {
  ...salesMember,
  applicationPrincipal: {
    type: 'application',
    roleId: 'manager',
    applicationId: 'application-id',
  },
};

describe('buildCallerRelatedRecordPathAccessGroupsOrThrow', () => {
  it('should hold the groups of the caller on the source object of a path', () => {
    expect(buildCallerAccessGroupObjectMetadataIds()).toEqual(['company']);
  });

  it('should also hold the groups reaching the source of an inherent path', () => {
    expect(
      buildCallerAccessGroupObjectMetadataIds({
        isCompanyAttachmentsPathInherent: true,
        objectNamesWithRlsRule: ['opportunity'],
      }),
    ).toEqual(['company', 'opportunity']);
  });

  it('should not go past the source of a regular path', () => {
    expect(
      buildCallerAccessGroupObjectMetadataIds({
        objectNamesWithRlsRule: ['company', 'opportunity'],
      }),
    ).toEqual(['company']);
  });

  it('should hold no group when no RLS rule restricts the source object', () => {
    expect(
      buildCallerAccessGroupObjectMetadataIds({ objectNamesWithRlsRule: [] }),
    ).toEqual([]);
  });

  it('should hold no group when access groups are disabled', () => {
    expect(
      buildCallerAccessGroupObjectMetadataIds({ isAccessGroupsEnabled: false }),
    ).toEqual([]);
  });

  it('should hold no group for a creation', () => {
    expect(
      buildCallerAccessGroupObjectMetadataIds({ operationType: 'create' }),
    ).toEqual([]);
  });

  it('should hold no group when a limiting role does not reach every source record', () => {
    expect(
      buildCallerAccessGroupObjectMetadataIds({
        principals: limitedByManagerRole,
      }),
    ).toEqual([]);
  });

  it('should not go past an inherent source a limiting role does not fully reach', () => {
    expect(
      buildCallerAccessGroupObjectMetadataIds({
        isCompanyAttachmentsPathInherent: true,
        objectNamesWithRlsRule: ['company'],
        principals: limitedByManagerRole,
      }),
    ).toEqual([]);
  });
});
