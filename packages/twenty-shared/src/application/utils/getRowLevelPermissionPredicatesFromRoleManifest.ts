import {
  type LegacyRowLevelPermissionPredicateGroupManifest,
  type LegacyRowLevelPermissionPredicateManifest,
  type RoleManifest,
} from '@/application/roleManifestType';
import { flattenRowLevelPermissionRuleManifests } from '@/application/utils/flattenRowLevelPermissionRuleManifests';
import { getRecordsPermissionsFromRoleManifest } from '@/application/utils/getRecordsPermissionsFromRoleManifest';

export const getRowLevelPermissionPredicatesFromRoleManifest = ({
  role,
}: {
  role: Pick<RoleManifest, 'recordsPermissions'>;
}): {
  predicateGroups: LegacyRowLevelPermissionPredicateGroupManifest[];
  predicates: LegacyRowLevelPermissionPredicateManifest[];
} =>
  flattenRowLevelPermissionRuleManifests({
    rules: getRecordsPermissionsFromRoleManifest({ role })
      .rowLevelPermissionRules,
  });
