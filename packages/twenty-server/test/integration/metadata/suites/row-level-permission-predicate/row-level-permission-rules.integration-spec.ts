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

const countLiveRows = async ({
  table,
  id,
}: {
  table: 'rowLevelPermissionPredicateGroup' | 'rowLevelPermissionPredicate';
  id: string;
}): Promise<number> => {
  const [{ count }] = await global.testDataSource.query(
    `SELECT COUNT(*) AS count FROM core."${table}" WHERE id = $1 AND "deletedAt" IS NULL`,
    [id],
  );

  return Number(count);
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

  it('should persist two rules on one object with different operations', async () => {
    const readRuleId = v4();
    const editRuleId = v4();

    const { data } = await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        roleId,
        objectMetadataId,
        rules: [
          buildRule({ id: readRuleId, canReadRecords: true }),
          buildRule({
            id: editRuleId,
            canReadRecords: true,
            canUpdateRecords: true,
            canSoftDeleteRecords: true,
          }),
        ],
      },
    });

    expect(
      data.upsertRowLevelPermissionRules.rules.map(({ id }) => id).sort(),
    ).toEqual([readRuleId, editRuleId].sort());
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
  });

  it('should change the operations of a rule updated by id', async () => {
    const ruleId = v4();
    const predicateGroupId = v4();
    const predicateId = v4();
    const upsertRule = (
      ruleOperations: Pick<
        RowLevelPermissionRuleInput,
        'canReadRecords' | 'canUpdateRecords' | 'canSoftDeleteRecords'
      >,
    ) =>
      upsertRowLevelPermissionRules({
        expectToFail: false,
        input: {
          roleId,
          objectMetadataId,
          rules: [
            buildRule({
              id: ruleId,
              predicateGroupId,
              predicateId,
              ...ruleOperations,
            }),
          ],
        },
      });

    await upsertRule({ canReadRecords: true });

    expect(await findRuleOperations(ruleId)).toEqual({
      canReadRecords: true,
      canUpdateRecords: false,
      canSoftDeleteRecords: false,
    });

    const { data } = await upsertRule({
      canReadRecords: false,
      canUpdateRecords: true,
      canSoftDeleteRecords: true,
    });

    expect(data.upsertRowLevelPermissionRules.rules).toEqual([
      expect.objectContaining({ id: ruleId }),
    ]);
    expect(await findRuleOperations(ruleId)).toEqual({
      canReadRecords: false,
      canUpdateRecords: true,
      canSoftDeleteRecords: true,
    });
  });

  it('should delete an omitted rule with its groups and predicates', async () => {
    const keptRuleId = v4();
    const removedRuleId = v4();
    const removedPredicateGroupId = v4();
    const removedPredicateId = v4();
    const keptRule = buildRule({ id: keptRuleId, canReadRecords: true });

    await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        roleId,
        objectMetadataId,
        rules: [
          keptRule,
          buildRule({
            id: removedRuleId,
            predicateGroupId: removedPredicateGroupId,
            predicateId: removedPredicateId,
            canReadRecords: true,
          }),
        ],
      },
    });

    const { data } = await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: { roleId, objectMetadataId, rules: [keptRule] },
    });

    expect(data.upsertRowLevelPermissionRules.rules).toEqual([
      expect.objectContaining({ id: keptRuleId }),
    ]);
    expect(
      data.upsertRowLevelPermissionRules.predicateGroups.map(
        ({ rowLevelPermissionRuleId }) => rowLevelPermissionRuleId,
      ),
    ).toEqual([keptRuleId]);
    expect(
      data.upsertRowLevelPermissionRules.predicates.map(
        ({ rowLevelPermissionRuleId }) => rowLevelPermissionRuleId,
      ),
    ).toEqual([keptRuleId]);
    expect(await findRuleOperations(removedRuleId)).toBeUndefined();
    expect(
      await countLiveRows({
        table: 'rowLevelPermissionPredicateGroup',
        id: removedPredicateGroupId,
      }),
    ).toBe(0);
    expect(
      await countLiveRows({
        table: 'rowLevelPermissionPredicate',
        id: removedPredicateId,
      }),
    ).toBe(0);
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

    for (const rules of [
      [
        buildRule({ id: duplicatedId, canReadRecords: true }),
        buildRule({ id: duplicatedId, canReadRecords: true }),
      ],
      [
        buildRule({
          id: duplicatedId,
          predicateGroupId: duplicatedId,
          canReadRecords: true,
        }),
      ],
      [
        buildRule({ predicateId: duplicatedId, canReadRecords: true }),
        buildRule({ predicateId: duplicatedId, canReadRecords: true }),
      ],
    ]) {
      const { errors } = await upsertRowLevelPermissionRules({
        expectToFail: true,
        input: { roleId, objectMetadataId, rules },
      });

      expect(errors?.[0]?.extensions?.subCode).toBe(
        'INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA',
      );
    }
  });
});
