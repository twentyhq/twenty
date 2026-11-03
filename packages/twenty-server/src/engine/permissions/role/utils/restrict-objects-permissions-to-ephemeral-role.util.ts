import { type ObjectsPermissions } from 'twenty-shared/types';

import { type PermissionsEphemeralRole } from 'src/engine/permissions/principal/types/permissions-ephemeral-role.type';
import { computePermissionIntersection } from 'src/engine/permissions/role/utils/compute-permission-intersection.util';

// the roles' predicates keep their insert-guard field exemption, except on fields the ephemeral role denies writing
export const restrictObjectsPermissionsToEphemeralRole = ({
  objectsPermissions,
  ephemeralRole,
}: {
  objectsPermissions: ObjectsPermissions;
  ephemeralRole: Pick<PermissionsEphemeralRole, 'objectsPermissions'>;
}): ObjectsPermissions => {
  const intersectedObjectsPermissions = computePermissionIntersection([
    objectsPermissions,
    ephemeralRole.objectsPermissions,
  ]);

  return Object.fromEntries(
    Object.entries(objectsPermissions).map(
      ([objectMetadataId, objectPermissions]) => {
        const ephemeralRoleRestrictedFields =
          ephemeralRole.objectsPermissions[objectMetadataId]
            ?.restrictedFields ?? {};

        return [
          objectMetadataId,
          {
            ...intersectedObjectsPermissions[objectMetadataId],
            rowLevelPermissionPredicates:
              objectPermissions.rowLevelPermissionPredicates.filter(
                ({ fieldMetadataId }) =>
                  ephemeralRoleRestrictedFields[fieldMetadataId]?.canUpdate !==
                  false,
              ),
            rowLevelPermissionPredicateGroups:
              objectPermissions.rowLevelPermissionPredicateGroups,
          },
        ];
      },
    ),
  );
};
