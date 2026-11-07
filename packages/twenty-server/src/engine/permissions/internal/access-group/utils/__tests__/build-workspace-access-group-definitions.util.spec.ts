import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildWorkspaceAccessGroupDefinitions } from 'src/engine/permissions/internal/access-group/utils/build-workspace-access-group-definitions.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const OBJECT_ID = 'object-id';

const flatObjectMetadataMaps = {
  byUniversalIdentifier: {
    [OBJECT_ID]: { id: OBJECT_ID, universalIdentifier: OBJECT_ID },
  },
  universalIdentifierById: { [OBJECT_ID]: OBJECT_ID },
} as unknown as FlatEntityMaps<FlatObjectMetadata>;

const flatFieldMetadataMaps = {
  byUniversalIdentifier: {},
  universalIdentifierById: {},
} as unknown as FlatEntityMaps<OrmFlatFieldMetadata>;

const noAccess = {
  canCreateAllRecords: false,
  canReadAllRecords: false,
  canUpdateAllRecords: false,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: false,
  restrictedFields: {},
};

const rolesPermissions = {
  healthy: {
    objects: { [OBJECT_ID]: { ...noAccess, canReadAllRecords: true } },
  },
  broken: {
    objects: {
      [OBJECT_ID]: {
        ...noAccess,
        rowLevelRecordsPermissions: {
          canCreateRecords: false,
          canReadRecords: true,
          canUpdateRecords: false,
          canSoftDeleteRecords: false,
          canDestroyRecords: false,
          predicates: [
            { id: 'stale', workspaceMemberFieldMetadataId: 'gone-field' },
          ],
          predicateGroups: [
            { id: 'rule', parentRowLevelPermissionPredicateGroupId: null },
          ],
        },
      },
    },
  },
} as unknown as Record<string, RoleRecordsPermissions>;

describe('buildWorkspaceAccessGroupDefinitions', () => {
  it('should report a role it cannot compute and still build the others', () => {
    const { definitions, failures } = buildWorkspaceAccessGroupDefinitions({
      rolesPermissions,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      userWorkspaceRoleMap: { 'user-workspace': 'broken' },
      flatWorkspaceMemberMaps: {
        idByUserWorkspaceId: { 'user-workspace': 'member' },
        byId: { member: { id: 'member' } },
      } as unknown as FlatWorkspaceMemberMaps,
    });

    expect(definitions.map(({ roleId }) => roleId)).toEqual(['healthy']);
    expect(failures).toEqual([
      expect.objectContaining({
        roleId: 'broken',
        objectMetadataId: OBJECT_ID,
      }),
    ]);
  });
});
