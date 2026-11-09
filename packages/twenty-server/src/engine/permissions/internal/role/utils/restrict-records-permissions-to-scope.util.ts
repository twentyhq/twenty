import { isDefined } from 'twenty-shared/utils';

import { type AiRunPermissionScope } from 'src/engine/permissions/principal/types/ai-run-permission-scope.type';
import { computePermissionIntersection } from 'src/engine/permissions/internal/role/utils/compute-permission-intersection.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

// the roles' predicates keep their insert-guard field exemption, except on fields the scope denies writing
export const restrictRecordsPermissionsToScope = ({
  recordsPermissions,
  aiRunScope,
}: {
  recordsPermissions: RoleRecordsPermissions;
  aiRunScope: Pick<AiRunPermissionScope, 'recordsPermissions'>;
}): RoleRecordsPermissions => {
  const intersectedRecordsPermissions = computePermissionIntersection([
    recordsPermissions,
    aiRunScope.recordsPermissions,
  ]);

  return {
    ...intersectedRecordsPermissions,
    objects: Object.fromEntries(
      Object.keys(recordsPermissions.objects).map((objectMetadataId) => {
        const roleRowLevelRecordsPermissions =
          recordsPermissions.objects[objectMetadataId]
            ?.rowLevelRecordsPermissions;
        const intersectedObjectRecordsPermissions =
          intersectedRecordsPermissions.objects[objectMetadataId];
        const scopeUneditableFields =
          aiRunScope.recordsPermissions.objects[objectMetadataId]
            ?.uneditableFields ?? [];

        if (
          !isDefined(
            intersectedObjectRecordsPermissions?.rowLevelRecordsPermissions,
          ) ||
          !isDefined(roleRowLevelRecordsPermissions)
        ) {
          return [objectMetadataId, intersectedObjectRecordsPermissions];
        }

        return [
          objectMetadataId,
          {
            ...intersectedObjectRecordsPermissions,
            rowLevelRecordsPermissions: {
              ...intersectedObjectRecordsPermissions.rowLevelRecordsPermissions,
              predicates: roleRowLevelRecordsPermissions.predicates.filter(
                ({ fieldMetadataId }) =>
                  !scopeUneditableFields.includes(fieldMetadataId),
              ),
              predicateGroups: roleRowLevelRecordsPermissions.predicateGroups,
            },
          },
        ];
      }),
    ),
  };
};
