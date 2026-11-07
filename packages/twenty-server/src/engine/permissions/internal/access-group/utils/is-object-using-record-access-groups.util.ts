/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

// Related record paths will also need them once they are evaluated
export const isObjectUsingRecordAccessGroups = ({
  rolesPermissions,
  objectMetadataId,
}: {
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  objectMetadataId: string;
}): boolean =>
  Object.values(rolesPermissions).some(({ objects }) =>
    isDefined(objects[objectMetadataId]?.rowLevelRecordsPermissions),
  );
