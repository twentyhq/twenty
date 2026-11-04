import { type ObjectsPermissions } from 'twenty-shared/types';

import { type AiRunPermissionScope } from 'src/engine/permissions/principal/types/ai-run-permission-scope.type';
import { computePermissionIntersection } from 'src/engine/permissions/role/utils/compute-permission-intersection.util';

// the roles' predicates keep their insert-guard field exemption, except on fields the scope denies writing
export const restrictObjectsPermissionsToScope = ({
  objectsPermissions,
  aiRunScope,
}: {
  objectsPermissions: ObjectsPermissions;
  aiRunScope: Pick<AiRunPermissionScope, 'objectsPermissions'>;
}): ObjectsPermissions => {
  const intersectedObjectsPermissions = computePermissionIntersection([
    objectsPermissions,
    aiRunScope.objectsPermissions,
  ]);

  return Object.fromEntries(
    Object.entries(objectsPermissions).map(
      ([objectMetadataId, objectPermissions]) => {
        const scopeRestrictedFields =
          aiRunScope.objectsPermissions[objectMetadataId]?.restrictedFields ??
          {};

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
