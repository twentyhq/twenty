/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type RlsRuleShape } from 'src/engine/permissions/internal/rls/types/rls-rule-shape.type';
import { resolveAccessGroupRuleShape } from 'src/engine/permissions/internal/access-group/utils/resolve-access-group-rule-shape.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const buildRlsRuleShapeByHash = ({
  objectMetadataId,
  rolesPermissions,
}: {
  objectMetadataId: string;
  rolesPermissions: Record<string, RoleRecordsPermissions>;
}): Map<string, RlsRuleShape> => {
  const ruleShapeByHash = new Map<string, RlsRuleShape>();

  for (const { objects } of Object.values(rolesPermissions)) {
    const objectRecordsPermissions = objects[objectMetadataId];

    if (!isDefined(objectRecordsPermissions)) {
      continue;
    }

    for (const rowLevelPermissionRule of objectRecordsPermissions.rowLevelRecordsPermissions ??
      []) {
      const { ruleShapeHash, splitPredicate } = resolveAccessGroupRuleShape({
        objectMetadataId,
        objectUnreadableFieldIds: objectRecordsPermissions.unreadableFields,
        rowLevelPermissionRule,
      });

      ruleShapeByHash.set(ruleShapeHash, {
        rowLevelPermissionRule,
        splitPredicate,
      });
    }
  }

  return ruleShapeByHash;
};
