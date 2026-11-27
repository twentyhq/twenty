import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type RolesReadingAllRecordsDTO } from 'src/engine/permissions/channel-visibility/dtos/roles-reading-all-records.dto';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

export const computeRolesReadingAllRecords = ({
  flatRoles,
  rolesPermissions,
  objectMetadataId,
}: {
  flatRoles: Pick<
    FlatRole,
    'id' | 'universalIdentifier' | 'canBeAssignedToUsers'
  >[];
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  objectMetadataId: string;
}): RolesReadingAllRecordsDTO => {
  const rolesReadingAllRecords = flatRoles.filter(
    ({ id, canBeAssignedToUsers }) =>
      canBeAssignedToUsers &&
      rolesPermissions[id]?.objects[objectMetadataId]?.canReadAllRecords,
  );
  const isAdminRoleIncluded = rolesReadingAllRecords.some(
    ({ universalIdentifier }) =>
      universalIdentifier === STANDARD_ROLE.admin.universalIdentifier,
  );

  return {
    isAdminRoleIncluded,
    otherRoleCount:
      rolesReadingAllRecords.length - (isAdminRoleIncluded ? 1 : 0),
  };
};
