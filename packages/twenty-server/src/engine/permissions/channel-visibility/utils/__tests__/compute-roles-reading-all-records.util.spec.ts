import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { computeRolesReadingAllRecords } from 'src/engine/permissions/channel-visibility/utils/compute-roles-reading-all-records.util';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

const OBJECT_METADATA_ID = 'object-metadata-id';

const buildRole = (id: string, overrides = {}) => ({
  id,
  universalIdentifier: `${id}-universal-identifier`,
  canBeAssignedToUsers: true,
  ...overrides,
});

const buildRolesPermissions = (
  canReadAllRecordsByRoleId: Record<string, boolean>,
): Record<string, RoleRecordsPermissions> =>
  Object.fromEntries(
    Object.entries(canReadAllRecordsByRoleId).map(
      ([roleId, canReadAllRecords]) => [
        roleId,
        {
          canReadAllRecords: true,
          canUpdateAllRecords: true,
          canSoftDeleteAllRecords: true,
          canDestroyAllRecords: true,
          objects: {
            [OBJECT_METADATA_ID]: {
              canReadAllRecords,
              canCreateAllRecords: false,
              canUpdateAllRecords: false,
              canSoftDeleteAllRecords: false,
              canDestroyAllRecords: false,
              unreadableFields: [],
              uneditableFields: [],
            },
          },
        },
      ],
    ),
  );

const ADMIN_ROLE = buildRole('admin', {
  universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
});

describe('computeRolesReadingAllRecords', () => {
  it('should report no role when no role reads all the records of the object', () => {
    expect(
      computeRolesReadingAllRecords({
        flatRoles: [ADMIN_ROLE, buildRole('member')],
        rolesPermissions: buildRolesPermissions({
          admin: false,
          member: false,
        }),
        objectMetadataId: OBJECT_METADATA_ID,
      }),
    ).toEqual({ isAdminRoleIncluded: false, otherRoleCount: 0 });
  });

  it('should report the admin role apart from the other roles', () => {
    expect(
      computeRolesReadingAllRecords({
        flatRoles: [
          ADMIN_ROLE,
          buildRole('member'),
          buildRole('support'),
          buildRole('sales'),
        ],
        rolesPermissions: buildRolesPermissions({
          admin: true,
          member: false,
          support: true,
          sales: true,
        }),
        objectMetadataId: OBJECT_METADATA_ID,
      }),
    ).toEqual({ isAdminRoleIncluded: true, otherRoleCount: 2 });
  });

  it('should count roles when the admin role does not read all records', () => {
    expect(
      computeRolesReadingAllRecords({
        flatRoles: [ADMIN_ROLE, buildRole('support'), buildRole('sales')],
        rolesPermissions: buildRolesPermissions({
          admin: false,
          support: true,
          sales: true,
        }),
        objectMetadataId: OBJECT_METADATA_ID,
      }),
    ).toEqual({ isAdminRoleIncluded: false, otherRoleCount: 2 });
  });

  it('should leave out roles that cannot be assigned to users', () => {
    expect(
      computeRolesReadingAllRecords({
        flatRoles: [buildRole('apiKey', { canBeAssignedToUsers: false })],
        rolesPermissions: buildRolesPermissions({ apiKey: true }),
        objectMetadataId: OBJECT_METADATA_ID,
      }),
    ).toEqual({ isAdminRoleIncluded: false, otherRoleCount: 0 });
  });
});
