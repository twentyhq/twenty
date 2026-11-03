import { type ObjectsPermissions } from 'twenty-shared/types';

import { type PermissionScope } from 'src/engine/permissions/principal/types/permission-scope.type';
import { computePermissionIntersection } from 'src/engine/permissions/role/utils/compute-permission-intersection.util';

// the roles' predicates keep their insert-guard field exemption, except on fields the scope denies writing
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
