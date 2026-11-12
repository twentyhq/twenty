import {
  type RoleManifest,
  type RowLevelPermissionPredicateGroupManifest,
  type RowLevelPermissionPredicateManifest,
} from '@/application/roleManifestType';
import { flattenRowLevelPermissionRuleManifests } from '@/application/utils/flattenRowLevelPermissionRuleManifests';
import { getRecordsPermissionsFromRoleManifest } from '@/application/utils/getRecordsPermissionsFromRoleManifest';

export const getRowLevelPermissionPredicatesFromRoleManifest = ({
  role,
}: {
  role: Pick<
    RoleManifest,
    | 'objectRecordsPermissions'
    | 'rowLevelPermissionPredicateGroups'
    | 'rowLevelPermissionPredicates'
  >;
}): {
  predicateGroups: RowLevelPermissionPredicateGroupManifest[];
  predicates: RowLevelPermissionPredicateManifest[];
} => {
  const { predicateGroups, predicates } =
    flattenRowLevelPermissionRuleManifests({
      rules: getRecordsPermissionsFromRoleManifest({ role })
        .rowLevelPermissionRules,
    });

  return {
    predicateGroups: [
      ...(role.rowLevelPermissionPredicateGroups ?? []),
      ...predicateGroups,
    ],
    predicates: [...(role.rowLevelPermissionPredicates ?? []), ...predicates],
  };
};
