/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type AccessGroupRuleShape } from 'src/engine/permissions/internal/access-group/types/access-group-rule-shape.type';
import { resolveAccessGroupRuleShape } from 'src/engine/permissions/internal/access-group/utils/resolve-access-group-rule-shape.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const buildAccessGroupRuleShapes = ({
  objectMetadataId,
  rolesPermissions,
  isRelationHopEnabled,
}: {
  objectMetadataId: string;
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  isRelationHopEnabled: boolean;
}): Map<string, AccessGroupRuleShape> => {
  const ruleShapeByHash = new Map<string, AccessGroupRuleShape>();

  for (const { objects } of Object.values(rolesPermissions)) {
    const objectRecordsPermissions = objects[objectMetadataId];

    if (!isDefined(objectRecordsPermissions)) {
      continue;
    }

    for (const rowLevelPermissionRule of objectRecordsPermissions.rowLevelRecordsPermissions ??
      []) {
      const { ruleShapeHash, literalValuePredicate } =
        resolveAccessGroupRuleShape({
          objectMetadataId,
          objectUnreadableFieldIds: objectRecordsPermissions.unreadableFields,
          rowLevelPermissionRule,
          isRelationHopEnabled,
        });

      ruleShapeByHash.set(ruleShapeHash, {
        rowLevelPermissionRule,
        literalValuePredicate,
      });
    }
  }

  return ruleShapeByHash;
};
