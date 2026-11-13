import {
  type DeprecatedRowLevelPermissionPredicateGroupManifest,
  type DeprecatedRowLevelPermissionPredicateManifest,
  type RoleManifest,
} from '@/application/roleManifestType';
import { flattenRowLevelPermissionRuleManifests } from '@/application/utils/flattenRowLevelPermissionRuleManifests';
import { getRecordsPermissionsFromRoleManifest } from '@/application/utils/getRecordsPermissionsFromRoleManifest';

export const getRowLevelPermissionPredicatesFromRoleManifest = ({
  role,
}: {
  role: Pick<RoleManifest, 'recordsPermissions'>;
}): {
  predicateGroups: DeprecatedRowLevelPermissionPredicateGroupManifest[];
  predicates: DeprecatedRowLevelPermissionPredicateManifest[];
} =>
  flattenRowLevelPermissionRuleManifests({
    rules: getRecordsPermissionsFromRoleManifest({ role })
      .rowLevelPermissionRules,
  });
