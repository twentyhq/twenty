import { upsertRowLevelPermissionRules } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-rules.util';
import { type PermissionTestWorkspace } from 'test/integration/permissions/utils/permission-test-workspace.type';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

export const upsertPermissionTestVisibilityTierRule = ({
  workspace,
  roleId,
  ruleId,
  visibilityTiers,
}: {
  workspace: Pick<
    PermissionTestWorkspace,
    'objectMetadataId' | 'visibilityTierFieldMetadataId' | 'adminAccessToken'
  >;
  roleId: string;
  ruleId: string;
  visibilityTiers: string[];
}) =>
  upsertRowLevelPermissionRules({
    input: {
      roleId,
      objectMetadataId: workspace.objectMetadataId,
      rules: [
        {
          canReadRecords: true,
          predicateGroups: [
            {
              id: ruleId,
              logicalOperator:
                RowLevelPermissionPredicateGroupLogicalOperator.AND,
              predicates: [
                {
                  id: v4(),
                  fieldMetadataId: workspace.visibilityTierFieldMetadataId,
                  operand: RowLevelPermissionPredicateOperand.IS,
                  value: visibilityTiers,
                },
              ],
            },
          ],
        },
      ],
    },
    expectToFail: false,
    token: workspace.adminAccessToken,
  });
