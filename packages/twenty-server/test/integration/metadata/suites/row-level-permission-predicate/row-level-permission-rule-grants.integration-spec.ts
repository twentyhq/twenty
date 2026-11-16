import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import { RowLevelPermissionPredicateGroupLogicalOperator } from 'twenty-shared/types';
import { v4 } from 'uuid';

type RuleGrantRow = {
  rowLevelPermissionRuleId: string;
  canReadRecords: boolean;
  canUpdateRecords: boolean;
  canSoftDeleteRecords: boolean;
};

const findRuleByPredicateGroupId = async (
  predicateGroupId: string,
): Promise<RuleGrantRow> => {
  const [ruleGrant] = await global.testDataSource.query(
    `SELECT g."rowLevelPermissionRuleId", r."canReadRecords", r."canUpdateRecords", r."canSoftDeleteRecords"
     FROM core."rowLevelPermissionPredicateGroup" g
     JOIN core."rowLevelPermissionRule" r ON r.id = g."rowLevelPermissionRuleId"
     WHERE g.id = $1`,
    [predicateGroupId],
  );

  return ruleGrant;
};

describe('row level permission rule grants', () => {
  let roleId: string;

  beforeEach(async () => {
    const { data } = await createOneRole({
      input: {
        label: 'Rule grants',
        canUpdateAllSettings: false,
        canReadAllObjectRecords: false,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });

    roleId = data.createOneRole.id;
  });

  afterEach(async () => {
    await deleteOneRole({ input: { idToDelete: roleId } });
  });

  it('should give each rule the grants sent for its predicate group', async () => {
    const objectMetadataId = await findObjectMetadataIdByName('company');
    const firstPredicateGroupId = v4();
    const secondPredicateGroupId = v4();

    const upsertRules = (
      ruleGrants: {
        rowLevelPermissionPredicateGroupId: string;
        canReadRecords: boolean;
        canUpdateRecords: boolean;
        canSoftDeleteRecords: boolean;
      }[],
    ) =>
      upsertRowLevelPermissionPredicates({
        expectToFail: false,
        input: {
          roleId,
          objectMetadataId,
          predicates: [],
          predicateGroups: [firstPredicateGroupId, secondPredicateGroupId].map(
            (id) => ({
              id,
              objectMetadataId,
              logicalOperator:
                RowLevelPermissionPredicateGroupLogicalOperator.AND,
            }),
          ),
          canReadRecords: true,
          canUpdateRecords: false,
          canSoftDeleteRecords: false,
          ruleGrants,
        },
      });

    await upsertRules([
      {
        rowLevelPermissionPredicateGroupId: secondPredicateGroupId,
        canReadRecords: true,
        canUpdateRecords: true,
        canSoftDeleteRecords: true,
      },
    ]);

    const firstRule = await findRuleByPredicateGroupId(firstPredicateGroupId);
    const secondRule = await findRuleByPredicateGroupId(secondPredicateGroupId);

    expect(firstRule.rowLevelPermissionRuleId).not.toBe(
      secondRule.rowLevelPermissionRuleId,
    );
    expect(firstRule).toMatchObject({
      canReadRecords: true,
      canUpdateRecords: false,
      canSoftDeleteRecords: false,
    });
    expect(secondRule).toMatchObject({
      canReadRecords: true,
      canUpdateRecords: true,
      canSoftDeleteRecords: true,
    });

    await upsertRules([
      {
        rowLevelPermissionPredicateGroupId: firstPredicateGroupId,
        canReadRecords: true,
        canUpdateRecords: true,
        canSoftDeleteRecords: false,
      },
      {
        rowLevelPermissionPredicateGroupId: secondPredicateGroupId,
        canReadRecords: false,
        canUpdateRecords: false,
        canSoftDeleteRecords: false,
      },
    ]);

    expect(
      await findRuleByPredicateGroupId(firstPredicateGroupId),
    ).toMatchObject({
      canReadRecords: true,
      canUpdateRecords: true,
      canSoftDeleteRecords: false,
    });
    expect(
      await findRuleByPredicateGroupId(secondPredicateGroupId),
    ).toMatchObject({
      canReadRecords: false,
      canUpdateRecords: false,
      canSoftDeleteRecords: false,
    });
  });

  it('should refuse rule grants that do not target one parentless predicate group each', async () => {
    const objectMetadataId = await findObjectMetadataIdByName('company');
    const predicateGroupId = v4();
    const childGroupId = v4();

    const upsertWithRuleGrantTargets = (
      rowLevelPermissionPredicateGroupIds: string[],
    ) =>
      upsertRowLevelPermissionPredicates({
        expectToFail: true,
        input: {
          roleId,
          objectMetadataId,
          predicates: [],
          predicateGroups: [
            {
              id: predicateGroupId,
              objectMetadataId,
              logicalOperator:
                RowLevelPermissionPredicateGroupLogicalOperator.AND,
            },
            {
              id: childGroupId,
              objectMetadataId,
              parentRowLevelPermissionPredicateGroupId: predicateGroupId,
              logicalOperator:
                RowLevelPermissionPredicateGroupLogicalOperator.AND,
            },
          ],
          canReadRecords: true,
          ruleGrants: rowLevelPermissionPredicateGroupIds.map(
            (rowLevelPermissionPredicateGroupId) => ({
              rowLevelPermissionPredicateGroupId,
              canReadRecords: true,
              canUpdateRecords: true,
            }),
          ),
        },
      });

    for (const rowLevelPermissionPredicateGroupIds of [
      [v4()],
      [childGroupId],
      [predicateGroupId, predicateGroupId],
    ]) {
      const { errors } = await upsertWithRuleGrantTargets(
        rowLevelPermissionPredicateGroupIds,
      );

      expect(errors?.[0]?.message).toContain('Rule grants target');
    }
  });
});
