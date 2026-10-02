import { type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { RenameUsageLimitMeterToUnitFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-instance-command-fast-1790953454195-rename-usage-limit-meter-to-unit';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

type UsageLimitFixture = {
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  limitKind: 'speed' | 'quota' | 'stock';
  meter: string;
  unit: UsageUnit;
};

const PERIOD_BY_LIMIT_KIND = {
  speed: { periodCount: 1, periodUnit: 'second' },
  quota: { periodCount: 1, periodUnit: 'month' },
  stock: { periodCount: 1, periodUnit: 'lifetime' },
} as const;

const METER_FIXTURES: UsageLimitFixture[] = [
  {
    resourceType: UsageResourceType.AI,
    operationType: UsageOperationType.ALL,
    limitKind: 'quota',
    meter: 'creditsUsedMicro',
    unit: UsageUnit.CREDIT,
  },
  {
    resourceType: UsageResourceType.STORAGE,
    operationType: UsageOperationType.STORAGE_FILE,
    limitKind: 'stock',
    meter: 'bytes',
    unit: UsageUnit.BYTE,
  },
  {
    resourceType: UsageResourceType.AI,
    operationType: UsageOperationType.AI_CHAT_TOKEN,
    limitKind: 'quota',
    meter: 'quantity',
    unit: UsageUnit.TOKEN,
  },
  {
    resourceType: UsageResourceType.AI,
    operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
    limitKind: 'quota',
    meter: 'quantity',
    unit: UsageUnit.TOKEN,
  },
  {
    resourceType: UsageResourceType.AI,
    operationType: UsageOperationType.WEB_SEARCH,
    limitKind: 'quota',
    meter: 'quantity',
    unit: UsageUnit.INVOCATION,
  },
  {
    resourceType: UsageResourceType.WORKFLOW,
    operationType: UsageOperationType.WORKFLOW_EXECUTION,
    limitKind: 'quota',
    meter: 'quantity',
    unit: UsageUnit.INVOCATION,
  },
  {
    resourceType: UsageResourceType.LOGIC_FUNCTION,
    operationType: UsageOperationType.CODE_EXECUTION,
    limitKind: 'quota',
    meter: 'quantity',
    unit: UsageUnit.INVOCATION,
  },
  {
    resourceType: UsageResourceType.EMAIL,
    operationType: UsageOperationType.EMAIL_SEND,
    limitKind: 'quota',
    meter: 'quantity',
    unit: UsageUnit.INVOCATION,
  },
  {
    resourceType: UsageResourceType.EMAIL,
    operationType: UsageOperationType.MESSAGE_CAMPAIGN_SEND,
    limitKind: 'speed',
    meter: 'quantity',
    unit: UsageUnit.INVOCATION,
  },
  {
    resourceType: UsageResourceType.API,
    operationType: UsageOperationType.API_REQUEST,
    limitKind: 'speed',
    meter: 'quantity',
    unit: UsageUnit.REQUEST,
  },
  {
    resourceType: UsageResourceType.WEBHOOK,
    operationType: UsageOperationType.WEBHOOK_CALL,
    limitKind: 'speed',
    meter: 'quantity',
    unit: UsageUnit.REQUEST,
  },
  {
    resourceType: UsageResourceType.STORAGE,
    operationType: UsageOperationType.STORAGE_FILE,
    limitKind: 'stock',
    meter: 'quantity',
    unit: UsageUnit.FILE,
  },
  {
    resourceType: UsageResourceType.RECORD,
    operationType: UsageOperationType.RECORD_WRITE,
    limitKind: 'stock',
    meter: 'quantity',
    unit: UsageUnit.RECORD,
  },
];

describe('2-46 fast instance command 1790953454195 - RenameUsageLimitMeterToUnitFastInstanceCommand (integration)', () => {
  const command = new RenameUsageLimitMeterToUnitFastInstanceCommand();
  let queryRunner: QueryRunner;
  let spenderId: string;

  const insertUsageLimit = async ({
    resourceType,
    operationType,
    limitKind,
    column,
    value,
  }: {
    resourceType: UsageResourceType;
    operationType: UsageOperationType;
    limitKind: UsageLimitFixture['limitKind'];
    column: 'meter' | 'unit';
    value: string;
  }): Promise<string> => {
    const id = v4();
    const { periodCount, periodUnit } = PERIOD_BY_LIMIT_KIND[limitKind];

    await queryRunner.query(
      `INSERT INTO "core"."usageLimit" (
        "id",
        "workspaceId",
        "resourceType",
        "operationType",
        "spenderType",
        "spenderId",
        "limitKind",
        "periodCount",
        "periodUnit",
        "${column}",
        "limitValue"
      ) VALUES ($1, $2, $3, $4, 'application', $5, $6, $7, $8, $9, 1000)`,
      [
        id,
        SEED_APPLE_WORKSPACE_ID,
        resourceType,
        operationType,
        spenderId,
        limitKind,
        periodCount,
        periodUnit,
        value,
      ],
    );

    return id;
  };

  const findColumnValues = async (
    column: 'meter' | 'unit',
  ): Promise<Record<string, string>> => {
    const rows: { id: string; value: string }[] = await queryRunner.query(
      `SELECT "id", "${column}" AS "value"
       FROM "core"."usageLimit"
       WHERE "spenderId" = $1`,
      [spenderId],
    );

    return Object.fromEntries(rows.map(({ id, value }) => [id, value]));
  };

  const findUsageLimitColumns = async (): Promise<
    {
      columnName: string;
      dataType: string;
      isNullable: string;
      columnDefault: string | null;
    }[]
  > =>
    queryRunner.query(
      `SELECT column_name AS "columnName", data_type AS "dataType",
              is_nullable AS "isNullable", column_default AS "columnDefault"
       FROM information_schema.columns
       WHERE table_schema = 'core'
         AND table_name = 'usageLimit'
         AND column_name IN ('meter', 'unit')`,
    );

  const findScopeConstraintDefinition = async (): Promise<string> => {
    const [row]: { definition: string }[] = await queryRunner.query(
      `SELECT pg_get_constraintdef(oid) AS "definition"
       FROM pg_constraint
       WHERE conname = 'UQ_USAGE_LIMIT_SCOPE'
         AND conrelid = '"core"."usageLimit"'::regclass`,
    );

    return row.definition;
  };

  beforeEach(async () => {
    spenderId = v4();
    queryRunner = global.testDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it('maps every meter to the unit it counts', async () => {
    await command.down(queryRunner);

    const expectedUnitById: Record<string, UsageUnit> = {};

    for (const {
      resourceType,
      operationType,
      limitKind,
      meter,
      unit,
    } of METER_FIXTURES) {
      const usageLimitId = await insertUsageLimit({
        resourceType,
        operationType,
        limitKind,
        column: 'meter',
        value: meter,
      });

      expectedUnitById[usageLimitId] = unit;
    }

    await command.up(queryRunner);

    expect(await findColumnValues('unit')).toEqual(expectedUnitById);
    expect(await findUsageLimitColumns()).toEqual([
      {
        columnName: 'unit',
        dataType: 'character varying',
        isNullable: 'NO',
        columnDefault: null,
      },
    ]);
    expect(await findScopeConstraintDefinition()).toMatch(
      /^UNIQUE \("workspaceId", "resourceType", "operationType", "spenderType", "spenderId", "limitKind", "periodCount", "periodUnit", "?unit"?\)$/,
    );
  });

  it('drops the limits no meter can hold and maps the rest back on down', async () => {
    const insertCodeExecutionUsageLimit = (unit: UsageUnit) =>
      insertUsageLimit({
        resourceType: UsageResourceType.LOGIC_FUNCTION,
        operationType: UsageOperationType.CODE_EXECUTION,
        limitKind: 'quota',
        column: 'unit',
        value: unit,
      });

    const creditUsageLimitId = await insertCodeExecutionUsageLimit(
      UsageUnit.CREDIT,
    );
    const invocationUsageLimitId = await insertCodeExecutionUsageLimit(
      UsageUnit.INVOCATION,
    );

    await insertCodeExecutionUsageLimit(UsageUnit.MILLISECOND);

    const byteUsageLimitId = await insertUsageLimit({
      resourceType: UsageResourceType.STORAGE,
      operationType: UsageOperationType.STORAGE_FILE,
      limitKind: 'stock',
      column: 'unit',
      value: UsageUnit.BYTE,
    });
    const fileUsageLimitId = await insertUsageLimit({
      resourceType: UsageResourceType.STORAGE,
      operationType: UsageOperationType.STORAGE_FILE,
      limitKind: 'stock',
      column: 'unit',
      value: UsageUnit.FILE,
    });
    const tokenUsageLimitId = await insertUsageLimit({
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      limitKind: 'quota',
      column: 'unit',
      value: UsageUnit.TOKEN,
    });

    await command.down(queryRunner);

    expect(await findColumnValues('meter')).toEqual({
      [creditUsageLimitId]: 'creditsUsedMicro',
      [invocationUsageLimitId]: 'quantity',
      [byteUsageLimitId]: 'bytes',
      [fileUsageLimitId]: 'quantity',
      [tokenUsageLimitId]: 'quantity',
    });
    expect(await findScopeConstraintDefinition()).toMatch(
      /"periodUnit", "?meter"?\)$/,
    );
  });
});
