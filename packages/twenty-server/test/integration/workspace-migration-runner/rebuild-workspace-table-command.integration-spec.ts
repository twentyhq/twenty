import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type RebuildWorkspaceTableCommand } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/commands/rebuild-workspace-table.command';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const TABLE_NAME = 'person';
const QUALIFIED_TABLE_NAME = `"${SCHEMA}"."${TABLE_NAME}"`;
const DROPPED_COLUMN_COUNT = 3;

describe('workspace:rebuild-table command (integration)', () => {
  let command: RebuildWorkspaceTableCommand;

  const runOnWorkspace = (
    options: { dryRun?: boolean; tableName?: string[] } = {},
  ) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options: { tableName: [TABLE_NAME], ...options },
      index: 0,
      total: 1,
      dataSource: global.testDataSource,
    });

  const readColumnSlots = async (): Promise<{
    usedColumnSlotCount: number;
    droppedColumnCount: number;
  }> => {
    const [columnSlots] = await global.testDataSource.query(
      `SELECT MAX(attnum)::int AS "usedColumnSlotCount",
              (COUNT(*) FILTER (WHERE attisdropped))::int AS "droppedColumnCount"
         FROM pg_attribute
        WHERE attrelid = $1::regclass AND attnum > 0`,
      [QUALIFIED_TABLE_NAME],
    );

    return columnSlots;
  };

  const readTableShape = async () => ({
    columns: await global.testDataSource.query(
      `SELECT attname, format_type(atttypid, atttypmod) AS type, attnotnull,
              attgenerated, pg_get_expr(adbin, adrelid) AS "defaultExpression"
         FROM pg_attribute
         LEFT JOIN pg_attrdef ON adrelid = attrelid AND adnum = attnum
        WHERE attrelid = $1::regclass AND attnum > 0 AND NOT attisdropped
        ORDER BY attname`,
      [QUALIFIED_TABLE_NAME],
    ),
    indexes: await global.testDataSource.query(
      `SELECT indexname, indexdef FROM pg_indexes
        WHERE schemaname = $1 AND tablename = $2
        ORDER BY indexname`,
      [SCHEMA, TABLE_NAME],
    ),
    constraints: await global.testDataSource.query(
      `SELECT conrelid::regclass::text AS "tableName", conname,
              pg_get_constraintdef(oid) AS definition, convalidated
         FROM pg_constraint
        WHERE conrelid = $1::regclass OR confrelid = $1::regclass
        ORDER BY 1, 2`,
      [QUALIFIED_TABLE_NAME],
    ),
    rows: await global.testDataSource.query(
      `SELECT id, "nameFirstName", "searchVector"::text AS "searchVector"
         FROM ${QUALIFIED_TABLE_NAME}
        ORDER BY id`,
    ),
  });

  const addDroppedColumns = async () => {
    for (let index = 0; index < DROPPED_COLUMN_COUNT; index++) {
      await global.testDataSource.query(
        `ALTER TABLE ${QUALIFIED_TABLE_NAME} ADD COLUMN "rebuildProbe${index}" text`,
      );
      await global.testDataSource.query(
        `ALTER TABLE ${QUALIFIED_TABLE_NAME} DROP COLUMN "rebuildProbe${index}"`,
      );
    }
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<RebuildWorkspaceTableCommand>(
      'RebuildWorkspaceTableCommand',
    );

    await addDroppedColumns();
  });

  it('should leave the table untouched on a dry run', async () => {
    const columnSlotsBefore = await readColumnSlots();

    await runOnWorkspace({ dryRun: true });

    expect(await readColumnSlots()).toEqual(columnSlotsBefore);
  });

  it('should throw when the table does not exist', async () => {
    await expect(
      runOnWorkspace({ tableName: ['tableThatDoesNotExist'] }),
    ).rejects.toMatchObject({ code: 'TABLE_NOT_FOUND' });
  });

  it('should free dropped column slots and keep rows, indexes and foreign keys', async () => {
    const columnSlotsBefore = await readColumnSlots();
    const tableShapeBefore = await readTableShape();

    expect(columnSlotsBefore.droppedColumnCount).toBeGreaterThanOrEqual(
      DROPPED_COLUMN_COUNT,
    );
    expect(tableShapeBefore.rows.length).toBeGreaterThan(0);

    await runOnWorkspace();

    expect(await readColumnSlots()).toEqual({
      usedColumnSlotCount: tableShapeBefore.columns.length,
      droppedColumnCount: 0,
    });
    expect(await readTableShape()).toEqual(tableShapeBefore);
  });

  it('should skip a table that has no dropped column', async () => {
    const [{ oid: oidBefore }] = await global.testDataSource.query(
      `SELECT $1::regclass::oid AS oid`,
      [QUALIFIED_TABLE_NAME],
    );

    await runOnWorkspace();

    const [{ oid: oidAfter }] = await global.testDataSource.query(
      `SELECT $1::regclass::oid AS oid`,
      [QUALIFIED_TABLE_NAME],
    );

    expect(oidAfter).toEqual(oidBefore);
  });
});
