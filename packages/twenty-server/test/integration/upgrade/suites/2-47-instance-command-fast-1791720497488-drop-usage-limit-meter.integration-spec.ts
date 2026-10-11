import { type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { DropUsageLimitMeterFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-instance-command-fast-1791720497488-drop-usage-limit-meter';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

describe('2-47 fast instance command 1791720497488 - DropUsageLimitMeterFastInstanceCommand (integration)', () => {
  const flush = jest.fn();
  const command = new DropUsageLimitMeterFastInstanceCommand({
    flush,
  } as unknown as WorkspaceCacheService);
  let queryRunner: QueryRunner;
  let spenderId: string;

  const insertUsageLimit = async ({
    resourceType,
    operationType,
    column,
    value,
  }: {
    resourceType: UsageResourceType;
    operationType: UsageOperationType;
    column: 'meter' | 'unit';
    value: string;
  }): Promise<string> => {
    const id = v4();

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
      ) VALUES ($1, $2, $3, $4, 'application', $5, 'quota', 1, 'month', $6, 1000)`,
      [
        id,
        SEED_APPLE_WORKSPACE_ID,
        resourceType,
        operationType,
        spenderId,
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
    { columnName: string; isNullable: string }[]
  > =>
    queryRunner.query(
      `SELECT column_name AS "columnName", is_nullable AS "isNullable"
       FROM information_schema.columns
       WHERE table_schema = 'core'
         AND table_name = 'usageLimit'
         AND column_name IN ('meter', 'unit') ORDER BY column_name`,
    );

  const findCompatibilityTriggerCount = async (): Promise<number> => {
    const rows: unknown[] = await queryRunner.query(
      `SELECT 1 FROM pg_trigger
       WHERE tgrelid = '"core"."usageLimit"'::regclass
         AND tgname = 'syncUsageLimitMeterAndUnit' AND NOT tgisinternal`,
    );

    return rows.length;
  };

  beforeEach(async () => {
    flush.mockReset();
    spenderId = v4();
    queryRunner =
      global.workflowTestServices.coreDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    await command.down(queryRunner);
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it('refuses to drop meter while a quota has no unit and keeps it stored', async () => {
    const pendingId = await insertUsageLimit({
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.ALL,
      column: 'meter',
      value: 'quantity',
    });

    await expect(command.up(queryRunner)).rejects.toThrow(
      /quotas without a unit \(.*AI\/ALL\/quantity: \d+/,
    );

    expect(await findColumnValues('meter')).toEqual({
      [pendingId]: 'quantity',
    });
    expect(await findCompatibilityTriggerCount()).toBe(1);
    expect(flush).not.toHaveBeenCalled();
  });

  it('drops meter and its trigger, requires a unit and flushes usage limits caches once every quota has one', async () => {
    const tokenId = await insertUsageLimit({
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      column: 'meter',
      value: 'quantity',
    });
    const creditId = await insertUsageLimit({
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.ALL,
      column: 'unit',
      value: UsageUnit.CREDIT,
    });

    await command.up(queryRunner);

    expect(await findUsageLimitColumns()).toEqual([
      { columnName: 'unit', isNullable: 'NO' },
    ]);
    expect(await findCompatibilityTriggerCount()).toBe(0);
    expect(await findColumnValues('unit')).toEqual({
      [tokenId]: UsageUnit.TOKEN,
      [creditId]: UsageUnit.CREDIT,
    });
    expect(flush).toHaveBeenCalledWith(SEED_APPLE_WORKSPACE_ID, [
      'usageLimits',
    ]);
    await expect(
      insertUsageLimit({
        resourceType: UsageResourceType.WORKFLOW,
        operationType: UsageOperationType.WORKFLOW_EXECUTION,
        column: 'meter',
        value: 'quantity',
      }),
    ).rejects.toThrow(/column "meter" .* does not exist/);
  });

  it('restores meter from unit on down and keeps both in sync again', async () => {
    const byteId = await insertUsageLimit({
      resourceType: UsageResourceType.STORAGE,
      operationType: UsageOperationType.STORAGE_FILE,
      column: 'unit',
      value: UsageUnit.BYTE,
    });

    await command.up(queryRunner);
    await command.down(queryRunner);

    expect(await findUsageLimitColumns()).toEqual([
      { columnName: 'meter', isNullable: 'NO' },
      { columnName: 'unit', isNullable: 'YES' },
    ]);
    expect(await findCompatibilityTriggerCount()).toBe(1);
    expect(await findColumnValues('meter')).toEqual({ [byteId]: 'bytes' });

    const oldWriterId = await insertUsageLimit({
      resourceType: UsageResourceType.WORKFLOW,
      operationType: UsageOperationType.WORKFLOW_EXECUTION,
      column: 'meter',
      value: 'quantity',
    });

    expect((await findColumnValues('unit'))[oldWriterId]).toBe(
      UsageUnit.INVOCATION,
    );
  });
});
