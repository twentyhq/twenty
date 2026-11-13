import { isDefined } from 'twenty-shared/utils';

import { type RuntimeLimitingRole } from 'src/engine/permissions/principal/types/runtime-limiting-role.type';
import { computePermissionIntersection } from 'src/engine/permissions/internal/role/utils/compute-permission-intersection.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

// the roles' predicates keep their insert-guard field exemption, except on fields the scope denies writing
export const restrictRecordsPermissionsToRuntimeLimitingRole = ({
  recordsPermissions,
  runtimeLimitingRole,
}: {
  recordsPermissions: RoleRecordsPermissions;
  runtimeLimitingRole: Pick<RuntimeLimitingRole, 'recordsPermissions'>;
}): RoleRecordsPermissions => {
  const intersectedRecordsPermissions = computePermissionIntersection([
    recordsPermissions,
    runtimeLimitingRole.recordsPermissions,
  ]);

  return {
    ...intersectedRecordsPermissions,
    objects: Object.fromEntries(
      Object.keys(recordsPermissions.objects).map((objectMetadataId) => {
        const intersectedObjectRecordsPermissions =
          intersectedRecordsPermissions.objects[objectMetadataId];
        const scopeUneditableFields =
          runtimeLimitingRole.recordsPermissions.objects[objectMetadataId]
            ?.uneditableFields ?? [];

        if (
          !isDefined(
            intersectedObjectRecordsPermissions?.rowLevelRecordsPermissions,
          )
        ) {
          return [objectMetadataId, intersectedObjectRecordsPermissions];
        }

        return [
          objectMetadataId,
          {
            ...intersectedObjectRecordsPermissions,
            rowLevelRecordsPermissions:
              intersectedObjectRecordsPermissions.rowLevelRecordsPermissions.map(
                (rule) => ({
                  ...rule,
                  predicates: rule.predicates.filter(
                    ({ fieldMetadataId }) =>
                      !scopeUneditableFields.includes(fieldMetadataId),
                  ),
                }),
              ),
          },
        ];
      }),
    ),
  };
};
