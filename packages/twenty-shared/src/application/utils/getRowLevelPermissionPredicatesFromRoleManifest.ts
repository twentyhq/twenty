import {
  type DeprecatedRowLevelPermissionPredicateGroupManifest,
  type DeprecatedRowLevelPermissionPredicateManifest,
  type NormalizedRoleManifest,
} from '@/application/roleManifestType';
import { flattenRowLevelPermissionRuleManifests } from '@/application/utils/flattenRowLevelPermissionRuleManifests';
import { getRecordsPermissionsFromRoleManifest } from '@/application/utils/getRecordsPermissionsFromRoleManifest';

export const getRowLevelPermissionPredicatesFromRoleManifest = ({
  role,
}: {
  role: Pick<NormalizedRoleManifest, 'recordsPermissions'>;
}): {
  predicateGroups: DeprecatedRowLevelPermissionPredicateGroupManifest[];
  predicates: DeprecatedRowLevelPermissionPredicateManifest[];
} =>
  flattenRowLevelPermissionRuleManifests({
    rules: getRecordsPermissionsFromRoleManifest({ role })
      .rowLevelPermissionRules,
  });
