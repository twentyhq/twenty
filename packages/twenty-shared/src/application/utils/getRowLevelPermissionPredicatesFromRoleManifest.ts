import {
  type RoleManifest,
  type RowLevelPermissionPredicateGroupManifest,
  type RowLevelPermissionPredicateManifest,
} from '@/application/roleManifestType';
import { flattenRowLevelPermissionRuleManifests } from '@/application/utils/flattenRowLevelPermissionRuleManifests';

export const getRowLevelPermissionPredicatesFromRoleManifest = ({
  role,
}: {
  role: Pick<
    RoleManifest,
    | 'rowLevelPermissionRules'
    | 'rowLevelPermissionPredicateGroups'
    | 'rowLevelPermissionPredicates'
  >;
}): {
  predicateGroups: RowLevelPermissionPredicateGroupManifest[];
  predicates: RowLevelPermissionPredicateManifest[];
} => {
  const { predicateGroups, predicates } =
    flattenRowLevelPermissionRuleManifests({
      rules: role.rowLevelPermissionRules ?? [],
    });

  return {
    predicateGroups: [
      ...(role.rowLevelPermissionPredicateGroups ?? []),
      ...predicateGroups,
    ],
    predicates: [...(role.rowLevelPermissionPredicates ?? []), ...predicates],
  };
};
