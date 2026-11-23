/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const isObjectRestrictedByRlsRule = ({
  rolesPermissions,
  objectMetadataId,
}: {
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  objectMetadataId: string;
}): boolean =>
  Object.values(rolesPermissions).some(({ objects }) =>
    isDefined(objects[objectMetadataId]?.rowLevelRecordsPermissions),
  );
