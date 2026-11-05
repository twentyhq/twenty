import { isDefined } from 'twenty-shared/utils';

import { type AiRunPermissionScope } from 'src/engine/permissions/principal/types/ai-run-permission-scope.type';
import { computePermissionIntersection } from 'src/engine/permissions/role/utils/compute-permission-intersection.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

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
              predicates: roleRowLevelRecordsPermissions.predicates,
              predicateGroups: roleRowLevelRecordsPermissions.predicateGroups,
            },
          },
        ];
      }),
    ),
  };
};
