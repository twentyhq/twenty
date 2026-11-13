import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { destroyOneOperation } from 'test/integration/graphql/utils/destroy-one-operation.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type RebuildWorkspaceObjectCommand } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/commands/rebuild-workspace-object.command';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const OBJECT_NAME_SINGULAR = 'person';
const TABLE_NAME = OBJECT_NAME_SINGULAR;
const QUALIFIED_TABLE_NAME = `"${SCHEMA}"."${TABLE_NAME}"`;
const DROPPED_COLUMN_COUNT = 3;

describe('workspace:rebuild-object command (integration)', () => {
  let command: RebuildWorkspaceObjectCommand;
  let personId: string;

  const runOnWorkspace = (
    options: { dryRun?: boolean; objectNameSingular?: string[] } = {},
  ) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options: { objectNameSingular: [OBJECT_NAME_SINGULAR], ...options },
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
    command = getAppProviderByClassName<RebuildWorkspaceObjectCommand>(
      'RebuildWorkspaceObjectCommand',
    );

    const { data } = await createOneOperation({
      objectMetadataSingularName: 'person',
      input: { name: { firstName: 'Rebuild', lastName: 'Table' } },
    });

    personId = data.createOneResponse.id;

    await addDroppedColumns();
  });

  afterAll(async () => {
    await destroyOneOperation({
      objectMetadataSingularName: 'person',
      recordId: personId,
    });
  });

  const countScheduledRebuilds = async (): Promise<number> => {
    const [{ count }] = await global.testDataSource.query(
      `SELECT COUNT(*)::int AS count FROM core."deferredWorkspaceOperation"
        WHERE "workspaceId" = $1 AND name = 'rebuild_object'`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    return count;
  };

  it('should schedule nothing on a dry run', async () => {
    await runOnWorkspace({ dryRun: true });

    expect(await countScheduledRebuilds()).toBe(0);
  });

  it('should throw when the object does not exist', async () => {
    await expect(
      runOnWorkspace({ objectNameSingular: ['objectThatDoesNotExist'] }),
    ).rejects.toMatchObject({ code: 'OBJECT_METADATA_NOT_FOUND' });
  });

  it('should free dropped column slots and keep rows, indexes and foreign keys', async () => {
    const columnSlotsBefore = await readColumnSlots();
    const tableShapeBefore = await readTableShape();

    expect(columnSlotsBefore.droppedColumnCount).toBeGreaterThanOrEqual(
      DROPPED_COLUMN_COUNT,
    );
    expect(tableShapeBefore.rows.length).toBeGreaterThan(0);

    await runOnWorkspace();

    await expectEventually(async () => {
      expect(await readColumnSlots()).toEqual({
        usedColumnSlotCount: tableShapeBefore.columns.length,
        droppedColumnCount: 0,
      });
      expect(await countScheduledRebuilds()).toBe(0);
    });
    expect(await readTableShape()).toEqual(tableShapeBefore);
  });

  it('should schedule nothing for an object whose table has no dropped column', async () => {
    await runOnWorkspace();

    expect(await countScheduledRebuilds()).toBe(0);
  });
});
