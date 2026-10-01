import { isDefined } from 'twenty-shared/utils';
import { DataSource, type QueryRunner } from 'typeorm';

import { RenameViewCalendarFieldsToStartAndEndFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-instance-command-fast-1790829838873-rename-view-calendar-fields-to-start-and-end';

jest.useRealTimers();

const START_FIELD_METADATA_ID = '11111111-1111-4111-8111-111111111111';
const LEGACY_FLAT_START_FIELD_METADATA_ID =
  '22222222-2222-4222-8222-222222222222';

describe('RenameViewCalendarFieldsToStartAndEndFastInstanceCommand (integration)', () => {
  let dataSource: DataSource;
  let queryRunner: QueryRunner;
  let authoredViewId: string;
  let legacyViewId: string;

  const command =
    new RenameViewCalendarFieldsToStartAndEndFastInstanceCommand();

  const getViewColumnNames = async (): Promise<string[]> => {
    const rows = (await queryRunner.query(
      `SELECT "column_name" FROM information_schema.columns
        WHERE table_schema = 'core' AND table_name = 'view'
          AND column_name ILIKE '%FieldMetadataId'`,
    )) as { column_name: string }[];

    return rows.map((row) => row.column_name);
  };

  const getViewConstraintNames = async (): Promise<string[]> => {
    const rows = (await queryRunner.query(
      `SELECT "conname" FROM pg_constraint
        WHERE conrelid = 'core.view'::regclass`,
    )) as { conname: string }[];

    return rows.map((row) => row.conname);
  };

  const getOverrides = async (viewId: string) => {
    const [row] = (await queryRunner.query(
      `SELECT "overrides" FROM "core"."view" WHERE "id" = $1`,
      [viewId],
    )) as { overrides: Record<string, unknown> | null }[];

    return row?.overrides;
  };

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      url: process.env.PG_DATABASE_URL,
      schema: 'core',
      entities: [],
      synchronize: false,
    });
    await dataSource.initialize();

    const views = (await dataSource.query(
      `SELECT "id" FROM "core"."view" ORDER BY "id" LIMIT 2`,
    )) as { id: string }[];

    if (views.length < 2 || !isDefined(views[0]) || !isDefined(views[1])) {
      throw new Error(
        'No seeded views found; run database:reset before the integration suite.',
      );
    }

    authoredViewId = views[0].id;
    legacyViewId = views[1].id;
  }, 30000);

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    await command.down(queryRunner);

    await queryRunner.query(
      `UPDATE "core"."view" SET "overrides" = $1::jsonb WHERE "id" = $2`,
      [
        JSON.stringify({
          'author-universal-identifier': {
            name: 'Overridden name',
            calendarFieldMetadataId: START_FIELD_METADATA_ID,
            calendarEndFieldMetadataId: null,
          },
        }),
        authoredViewId,
      ],
    );
    await queryRunner.query(
      `UPDATE "core"."view" SET "overrides" = $1::jsonb WHERE "id" = $2`,
      [
        JSON.stringify({
          calendarFieldMetadataId: LEGACY_FLAT_START_FIELD_METADATA_ID,
        }),
        legacyViewId,
      ],
    );
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it('renames the columns, foreign keys and calendar check constraint', async () => {
    expect(await getViewColumnNames()).toEqual(
      expect.arrayContaining([
        'calendarFieldMetadataId',
        'calendarEndFieldMetadataId',
      ]),
    );

    await command.up(queryRunner);

    const columnNames = await getViewColumnNames();

    expect(columnNames).toEqual(
      expect.arrayContaining(['startFieldMetadataId', 'endFieldMetadataId']),
    );
    expect(columnNames).not.toContain('calendarFieldMetadataId');
    expect(columnNames).not.toContain('calendarEndFieldMetadataId');
    expect(await getViewConstraintNames()).toEqual(
      expect.arrayContaining([
        'FK_456045f79f0451e27d406d08da3',
        'FK_ce2547d8dfa1287014f75fc7541',
        'CHK_VIEW_CALENDAR_INTEGRITY',
      ]),
    );
  });

  it('renames override keys in authored and legacy flat overrides', async () => {
    await command.up(queryRunner);

    expect(await getOverrides(authoredViewId)).toEqual({
      'author-universal-identifier': {
        name: 'Overridden name',
        startFieldMetadataId: START_FIELD_METADATA_ID,
        endFieldMetadataId: null,
      },
    });
    expect(await getOverrides(legacyViewId)).toEqual({
      startFieldMetadataId: LEGACY_FLAT_START_FIELD_METADATA_ID,
    });
  });
});
