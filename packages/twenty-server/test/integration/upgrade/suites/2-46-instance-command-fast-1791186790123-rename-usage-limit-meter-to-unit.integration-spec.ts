import { type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { RenameUsageLimitMeterToUnitFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-instance-command-fast-1791186790123-rename-usage-limit-meter-to-unit';
import { RestoreUsageLimitMeterCompatibilityFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-instance-command-fast-1791538680877-restore-usage-limit-meter-compatibility';
import { UsageLimitsCacheService } from 'src/engine/core-modules/usage-limit/services/usage-limits-cache.service';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { WorkspaceCacheRowsBatchLoader } from 'src/engine/workspace-cache/services/workspace-cache-rows-batch-loader';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

type UsageLimitFixture = {
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  limitKind: 'speed' | 'quota' | 'stock';
  meter: string;
  unit: UsageUnit | null;
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
    meter: 'quantity',
    unit: null,
  },
  {
    resourceType: UsageResourceType.WORKFLOW,
    operationType: UsageOperationType.ALL,
    limitKind: 'quota',
    meter: 'quantity',
    unit: null,
  },
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

describe('2-46 fast instance command 1791186790123 - RenameUsageLimitMeterToUnitFastInstanceCommand (integration)', () => {
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
  ): Promise<Record<string, string | null>> => {
    const rows: { id: string; value: string | null }[] =
      await queryRunner.query(
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
         AND column_name IN ('meter', 'unit') ORDER BY column_name`,
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
    queryRunner =
      global.workflowTestServices.coreDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it('retains old meters and leaves unmappable quantities stored without a unit', async () => {
    await command.down(queryRunner);

    const expectedUnitById: Record<string, UsageUnit | null> = {};
    const expectedMeterById: Record<string, string> = {};

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
      expectedMeterById[usageLimitId] = meter;
    }

    await command.up(queryRunner);

    expect(await findColumnValues('unit')).toEqual(expectedUnitById);
    expect(await findColumnValues('meter')).toEqual(expectedMeterById);
    expect(await findUsageLimitColumns()).toEqual([
      {
        columnName: 'meter',
        dataType: 'character varying',
        isNullable: 'NO',
        columnDefault: null,
      },
      {
        columnName: 'unit',
        dataType: 'character varying',
        isNullable: 'YES',
        columnDefault: null,
      },
    ]);
    expect(await findScopeConstraintDefinition()).toMatch(
      /^UNIQUE \("workspaceId", "resourceType", "operationType", "spenderType", "spenderId", "limitKind", "periodCount", "periodUnit", "?unit"?\)$/,
    );
  });

  it('accepts writes from both versions throughout the rollout', async () => {
    await command.down(queryRunner);
    await command.up(queryRunner);

    const oldWriterId = await insertUsageLimit({
      resourceType: UsageResourceType.WORKFLOW,
      operationType: UsageOperationType.WORKFLOW_EXECUTION,
      limitKind: 'quota',
      column: 'meter',
      value: 'quantity',
    });
    const newWriterId = await insertUsageLimit({
      resourceType: UsageResourceType.STORAGE,
      operationType: UsageOperationType.STORAGE_FILE,
      limitKind: 'stock',
      column: 'unit',
      value: UsageUnit.FILE,
    });

    expect(await findColumnValues('unit')).toEqual({
      [oldWriterId]: UsageUnit.INVOCATION,
      [newWriterId]: UsageUnit.FILE,
    });
    expect(await findColumnValues('meter')).toEqual({
      [oldWriterId]: 'quantity',
      [newWriterId]: 'quantity',
    });

    await queryRunner.query(
      `UPDATE "core"."usageLimit" SET "meter" = 'bytes' WHERE id = $1`,
      [newWriterId],
    );
    expect((await findColumnValues('unit'))[newWriterId]).toBe(UsageUnit.BYTE);

    await queryRunner.query(
      `UPDATE "core"."usageLimit" SET "unit" = 'CREDIT' WHERE id = $1`,
      [oldWriterId],
    );
    expect((await findColumnValues('meter'))[oldWriterId]).toBe(
      'creditsUsedMicro',
    );
  });

  it('keeps an ALL quantity written by an old pod without failing the write', async () => {
    await command.up(queryRunner);

    const id = await insertUsageLimit({
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.ALL,
      limitKind: 'quota',
      column: 'meter',
      value: 'quantity',
    });

    expect(await findColumnValues('unit')).toEqual({ [id]: null });
    expect(await findColumnValues('meter')).toEqual({ [id]: 'quantity' });

    await command.down(queryRunner);

    expect(await findColumnValues('meter')).toEqual({ [id]: 'quantity' });
  });

  it('restores old reads on instances that already applied the rename and can run twice', async () => {
    await command.up(queryRunner);

    const id = await insertUsageLimit({
      resourceType: UsageResourceType.WORKFLOW,
      operationType: UsageOperationType.WORKFLOW_EXECUTION,
      limitKind: 'quota',
      column: 'unit',
      value: UsageUnit.INVOCATION,
    });

    await queryRunner.query(
      `DROP TRIGGER "syncUsageLimitMeterAndUnit" ON "core"."usageLimit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" DROP COLUMN "meter"`,
    );

    const repair = new RestoreUsageLimitMeterCompatibilityFastInstanceCommand();

    await repair.up(queryRunner);
    await repair.up(queryRunner);

    expect(await findColumnValues('meter')).toEqual({ [id]: 'quantity' });
    expect(await findColumnValues('unit')).toEqual({
      [id]: UsageUnit.INVOCATION,
    });
  });

  it('retains unmapped quotas in storage without loading them into enforcement', async () => {
    await command.up(queryRunner);

    const pendingId = await insertUsageLimit({
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.ALL,
      limitKind: 'quota',
      column: 'meter',
      value: 'quantity',
    });
    const activeId = await insertUsageLimit({
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      limitKind: 'quota',
      column: 'unit',
      value: UsageUnit.TOKEN,
    });
    const provider = new UsageLimitsCacheService();
    const usageLimitRepository = queryRunner.manager.withRepository(
      getCoreRepository<UsageLimitEntity>(UsageLimitEntity),
    );
    const loader = new WorkspaceCacheRowsBatchLoader(
      { getRepository: () => usageLimitRepository },
      SEED_APPLE_WORKSPACE_ID,
    );

    await loader.loadRows([provider.rowsRequirement]);

    const limits = provider.computeForCache({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      rows: loader.readRows(provider.rowsRequirement),
    });
    const fixtureLimits = (
      limits.byResourceType[UsageResourceType.AI] ?? []
    ).filter((limit) => limit.spenderId === spenderId);

    expect(fixtureLimits.map(({ id }) => id)).toEqual([activeId]);
    expect(await findColumnValues('meter')).toEqual({
      [pendingId]: 'quantity',
      [activeId]: 'quantity',
    });
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
    expect(await findUsageLimitColumns()).toEqual([
      {
        columnName: 'meter',
        dataType: 'character varying',
        isNullable: 'NO',
        columnDefault: null,
      },
    ]);
  });
});
