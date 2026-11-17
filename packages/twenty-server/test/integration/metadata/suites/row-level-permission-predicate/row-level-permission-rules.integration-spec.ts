import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { upsertRowLevelPermissionRules } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-rules.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type RowLevelPermissionRuleInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-rules.input';

type RuleOperationsRow = {
  canReadRecords: boolean;
  canUpdateRecords: boolean;
  canSoftDeleteRecords: boolean;
};

const findRuleOperations = async (
  ruleId: string,
): Promise<RuleOperationsRow | undefined> => {
  const [rule] = await global.testDataSource.query(
    `SELECT "canReadRecords", "canUpdateRecords", "canSoftDeleteRecords" FROM core."rowLevelPermissionRule" WHERE id = $1`,
    [ruleId],
  );

  return rule;
};

const createRole = async (label: string): Promise<string> => {
  const { data } = await createOneRole({
    input: {
      label,
      canUpdateAllSettings: false,
      canReadAllObjectRecords: false,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
    },
  });

  return data.createOneRole.id;
};

describe('row level permission rules', () => {
  let roleId: string;
  let objectMetadataId: string;
  let nameFieldMetadataId: string;

  const buildRule = ({
    id,
    predicateGroupId = v4(),
    predicateId = v4(),
    ...ruleOperations
  }: Omit<RowLevelPermissionRuleInput, 'predicates' | 'predicateGroups'> & {
    predicateGroupId?: string;
    predicateId?: string;
  }): RowLevelPermissionRuleInput => ({
    id,
    ...ruleOperations,
    predicateGroups: [
      {
        id: predicateGroupId,
        logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
        predicates: [
          {
            id: predicateId,
            fieldMetadataId: nameFieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            value: 'Apple',
          },
        ],
      },
    ],
  });

  beforeAll(async () => {
    objectMetadataId = await findObjectMetadataIdByName('company');
    [{ id: nameFieldMetadataId }] = await global.testDataSource.query(
      `SELECT "id" FROM core."fieldMetadata" WHERE "objectMetadataId" = $1 AND "name" = 'name'`,
      [objectMetadataId],
    );
  });

  beforeEach(async () => {
    roleId = await createRole('Row level permission rules');
  });

  afterEach(async () => {
    await deleteOneRole({ input: { idToDelete: roleId } });
  });

  it('should keep each rule with its own operations, update one by id and delete an omitted one', async () => {
    const readRuleId = v4();
    const editRuleId = v4();
    const readRule = buildRule({ id: readRuleId, canReadRecords: true });

    await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        roleId,
        objectMetadataId,
        rules: [
          readRule,
          buildRule({
            id: editRuleId,
            canReadRecords: true,
            canUpdateRecords: true,
            canSoftDeleteRecords: true,
          }),
        ],
      },
    });

    expect(await findRuleOperations(readRuleId)).toEqual({
      canReadRecords: true,
      canUpdateRecords: false,
      canSoftDeleteRecords: false,
    });
    expect(await findRuleOperations(editRuleId)).toEqual({
      canReadRecords: true,
      canUpdateRecords: true,
      canSoftDeleteRecords: true,
    });

    const { data } = await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        roleId,
        objectMetadataId,
        rules: [{ ...readRule, canUpdateRecords: true }],
      },
    });

    const { rules, predicateGroups, predicates } =
      data.upsertRowLevelPermissionRules;

    expect(rules).toEqual([expect.objectContaining({ id: readRuleId })]);
    expect(await findRuleOperations(readRuleId)).toEqual({
      canReadRecords: true,
      canUpdateRecords: true,
      canSoftDeleteRecords: false,
    });
    expect(await findRuleOperations(editRuleId)).toBeUndefined();
    expect(
      [...predicateGroups, ...predicates].map(
        ({ rowLevelPermissionRuleId }) => rowLevelPermissionRuleId,
      ),
    ).toEqual([readRuleId, readRuleId]);
  });

  it('should refuse a rule id that belongs to another role', async () => {
    const otherRoleId = await createRole('Row level permission rules owner');
    const otherRoleRuleId = v4();

    try {
      await upsertRowLevelPermissionRules({
        expectToFail: false,
        input: {
          roleId: otherRoleId,
          objectMetadataId,
          rules: [buildRule({ id: otherRoleRuleId, canReadRecords: true })],
        },
      });

      const { errors } = await upsertRowLevelPermissionRules({
        expectToFail: true,
        input: {
          roleId,
          objectMetadataId,
          rules: [
            buildRule({
              id: otherRoleRuleId,
              canReadRecords: true,
              canUpdateRecords: true,
            }),
          ],
        },
      });

      expect(errors?.[0]?.message).toContain(
        'Rule belongs to a different role or object',
      );
      expect(await findRuleOperations(otherRoleRuleId)).toEqual({
        canReadRecords: true,
        canUpdateRecords: false,
        canSoftDeleteRecords: false,
      });
    } finally {
      await deleteOneRole({ input: { idToDelete: otherRoleId } });
    }
  });

  it('should refuse the same id used twice', async () => {
    const duplicatedId = v4();

    const { errors } = await upsertRowLevelPermissionRules({
      expectToFail: true,
      input: {
        roleId,
        objectMetadataId,
        rules: [
          buildRule({
            id: duplicatedId,
            predicateGroupId: duplicatedId,
            canReadRecords: true,
          }),
        ],
      },
    });

    expect(errors?.[0]?.extensions?.subCode).toBe(
      'INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA',
    );
  });
});
