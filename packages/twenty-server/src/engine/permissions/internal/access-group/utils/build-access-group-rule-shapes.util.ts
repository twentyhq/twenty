/* @license Enterprise */

import { type RowLevelPermissionPredicate } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { resolveAccessGroupRuleShape } from 'src/engine/permissions/internal/access-group/utils/resolve-access-group-rule-shape.util';
import { type RlsRule } from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export type AccessGroupRuleShape = {
  rowLevelPermissionRule: RlsRule;
  literalValuePredicate: RowLevelPermissionPredicate | null;
};

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
