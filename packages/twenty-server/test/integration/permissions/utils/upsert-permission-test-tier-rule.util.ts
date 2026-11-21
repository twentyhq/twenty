import { upsertRowLevelPermissionRules } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-rules.util';
import { type PermissionTestWorkspace } from 'test/integration/permissions/utils/permission-test-workspace.type';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

export const upsertPermissionTestTierRule = ({
  workspace,
  roleId,
  ruleId,
  tiers,
}: {
  workspace: Pick<
    PermissionTestWorkspace,
    'objectMetadataId' | 'tierFieldMetadataId' | 'adminAccessToken'
  >;
  roleId: string;
  ruleId: string;
  tiers: string[];
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
                  fieldMetadataId: workspace.tierFieldMetadataId,
                  operand: RowLevelPermissionPredicateOperand.IS,
                  value: tiers,
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
