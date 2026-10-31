import { type ObjectsPermissions } from 'twenty-shared/types';

import { type PermissionScope } from 'src/engine/permissions/principal/types/permission-scope.type';
import { computePermissionIntersection } from 'src/engine/permissions/role/utils/compute-permission-intersection.util';

// the roles' row-level predicates are kept: a scope has none, so intersecting with it would drop them
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
      ([objectMetadataId, objectPermissions]) => [
        objectMetadataId,
        {
          ...intersectedObjectsPermissions[objectMetadataId],
          rowLevelPermissionPredicates:
            objectPermissions.rowLevelPermissionPredicates,
          rowLevelPermissionPredicateGroups:
            objectPermissions.rowLevelPermissionPredicateGroups,
        },
      ],
    ),
  );
};
