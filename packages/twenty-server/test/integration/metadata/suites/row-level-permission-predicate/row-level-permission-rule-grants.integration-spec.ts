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

const findRuleGrantByRootGroupId = async (
  rootGroupId: string,
): Promise<RuleGrantRow> => {
  const [ruleGrant] = await global.testDataSource.query(
    `SELECT g."rowLevelPermissionRuleId", r."canReadRecords", r."canUpdateRecords", r."canSoftDeleteRecords"
     FROM core."rowLevelPermissionPredicateGroup" g
     JOIN core."rowLevelPermissionRule" r ON r.id = g."rowLevelPermissionRuleId"
     WHERE g.id = $1`,
    [rootGroupId],
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

  it('should give each rule the grants sent for its root group', async () => {
    const objectMetadataId = await findObjectMetadataIdByName('company');
    const firstRootGroupId = v4();
    const secondRootGroupId = v4();

    const upsertRules = (
      ruleGrants: {
        rootPredicateGroupId: string;
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
          predicateGroups: [firstRootGroupId, secondRootGroupId].map((id) => ({
            id,
            objectMetadataId,
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
          })),
          canReadRecords: true,
          canUpdateRecords: false,
          canSoftDeleteRecords: false,
          ruleGrants,
        },
      });

    await upsertRules([
      {
        rootPredicateGroupId: secondRootGroupId,
        canReadRecords: true,
        canUpdateRecords: true,
        canSoftDeleteRecords: true,
      },
    ]);

    const firstRule = await findRuleGrantByRootGroupId(firstRootGroupId);
    const secondRule = await findRuleGrantByRootGroupId(secondRootGroupId);

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
        rootPredicateGroupId: firstRootGroupId,
        canReadRecords: true,
        canUpdateRecords: true,
        canSoftDeleteRecords: false,
      },
      {
        rootPredicateGroupId: secondRootGroupId,
        canReadRecords: false,
        canUpdateRecords: false,
        canSoftDeleteRecords: false,
      },
    ]);

    expect(await findRuleGrantByRootGroupId(firstRootGroupId)).toMatchObject({
      canReadRecords: true,
      canUpdateRecords: true,
      canSoftDeleteRecords: false,
    });
    expect(await findRuleGrantByRootGroupId(secondRootGroupId)).toMatchObject({
      canReadRecords: false,
      canUpdateRecords: false,
      canSoftDeleteRecords: false,
    });
  });

  it('should refuse rule grants that do not target one root group each', async () => {
    const objectMetadataId = await findObjectMetadataIdByName('company');
    const rootGroupId = v4();
    const childGroupId = v4();

    const upsertWithRuleGrantTargets = (rootPredicateGroupIds: string[]) =>
      upsertRowLevelPermissionPredicates({
        expectToFail: true,
        input: {
          roleId,
          objectMetadataId,
          predicates: [],
          predicateGroups: [
            {
              id: rootGroupId,
              objectMetadataId,
              logicalOperator:
                RowLevelPermissionPredicateGroupLogicalOperator.AND,
            },
            {
              id: childGroupId,
              objectMetadataId,
              parentRowLevelPermissionPredicateGroupId: rootGroupId,
              logicalOperator:
                RowLevelPermissionPredicateGroupLogicalOperator.AND,
            },
          ],
          canReadRecords: true,
          ruleGrants: rootPredicateGroupIds.map((rootPredicateGroupId) => ({
            rootPredicateGroupId,
            canReadRecords: true,
            canUpdateRecords: true,
          })),
        },
      });

    for (const rootPredicateGroupIds of [
      [v4()],
      [childGroupId],
      [rootGroupId, rootGroupId],
    ]) {
      const { errors } = await upsertWithRuleGrantTargets(
        rootPredicateGroupIds,
      );

      expect(errors?.[0]?.message).toContain('Rule grants target');
    }
  });
});
