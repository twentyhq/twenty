import { type ObjectsPermissions } from 'twenty-shared/types';

import { type PermissionScope } from 'src/engine/permissions/principal/types/permission-scope.type';
import { computePermissionIntersection } from 'src/engine/permissions/role/utils/compute-permission-intersection.util';

// the roles' predicates are kept, as a scope has none, so the insert guard still exempts their fields;
// a field the scope denies writing loses that exemption, while the roles' row filter still applies on write
export const restrictObjectsPermissionsToScope = ({
  objectsPermissions,
  scope,
}: {
  objectsPermissions: ObjectsPermissions;
  scope: Pick<PermissionScope, 'objectsPermissions'>;
}): ObjectsPermissions => {
  const intersectedObjectsPermissions = computePermissionIntersection([
    objectsPermissions,
    scope.objectsPermissions,
  ]);

  return Object.fromEntries(
    Object.entries(objectsPermissions).map(
      ([objectMetadataId, objectPermissions]) => {
        const scopeRestrictedFields =
          scope.objectsPermissions[objectMetadataId]?.restrictedFields ?? {};

        return [
          objectMetadataId,
          {
            ...intersectedObjectsPermissions[objectMetadataId],
            rowLevelPermissionPredicates:
              objectPermissions.rowLevelPermissionPredicates.filter(
                ({ fieldMetadataId }) =>
                  scopeRestrictedFields[fieldMetadataId]?.canUpdate !== false,
              ),
            rowLevelPermissionPredicateGroups:
              objectPermissions.rowLevelPermissionPredicateGroups,
          },
        ];
      },
    ),
  );
};
