import { config } from 'dotenv';
import { DataSource } from 'typeorm';

import { MigrateLegacyReadabilityParentFieldsSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-instance-command-slow-1789153800001-migrate-legacy-readability-parent-fields';

jest.useRealTimers();

config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

const LEGACY_COLUMN_NAME = 'readabilityParentFieldUniversalIdentifiers';
const LEGACY_FIELD_UNIVERSAL_IDENTIFIER =
  '11111111-1111-4111-8111-111111111111';

describe('MigrateLegacyReadabilityParentFieldsSlowInstanceCommand (integration)', () => {
  let dataSource: DataSource;
  let command: MigrateLegacyReadabilityParentFieldsSlowInstanceCommand;
  let objectMetadataId: string;
  let workspaceId: string;
  let applicationId: string;

  const readInheritance = async () => {
    const [row] = await dataSource.query(
      `SELECT "inheritance" FROM "core"."objectMetadata" WHERE id = $1`,
      [objectMetadataId],
    );

    return row.inheritance;
  };

  const hasLegacyColumn = async () => {
    const rows = await dataSource.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'core' AND table_name = 'objectMetadata' AND column_name = $1`,
      [LEGACY_COLUMN_NAME],
    );

    return rows.length > 0;
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

    command = new MigrateLegacyReadabilityParentFieldsSlowInstanceCommand();

    const [seedObject] = await dataSource.query(
      `SELECT id, "workspaceId", "applicationId" FROM "core"."objectMetadata" LIMIT 1`,
    );

    workspaceId = seedObject.workspaceId;
    applicationId = seedObject.applicationId;

    await dataSource.query(
      `ALTER TABLE "core"."objectMetadata" ADD COLUMN IF NOT EXISTS "${LEGACY_COLUMN_NAME}" uuid array`,
    );

    const [insertedObject] = await dataSource.query(
      `INSERT INTO "core"."objectMetadata"
         ("nameSingular", "namePlural", "labelSingular", "labelPlural", "targetTableName",
          "workspaceId", "applicationId", "universalIdentifier", "readability", "${LEGACY_COLUMN_NAME}")
       VALUES ('legacyInheritedChild', 'legacyInheritedChildren', 'Legacy', 'Legacies', 'DEPRECATED',
               $1, $2, gen_random_uuid(), 'INHERITED', ARRAY[$3]::uuid[])
       RETURNING id`,
      [workspaceId, applicationId, LEGACY_FIELD_UNIVERSAL_IDENTIFIER],
    );

    objectMetadataId = insertedObject.id;
  });

  afterAll(async () => {
    await dataSource.query(
      `DELETE FROM "core"."objectMetadata" WHERE id = $1`,
      [objectMetadataId],
    );
    await dataSource.destroy();
  });

  it('turns the legacy parent field list into an ANY policy and drops the legacy column', async () => {
    expect(await hasLegacyColumn()).toBe(true);

    await command.runDataMigration(dataSource);

    expect(await readInheritance()).toEqual({
      match: 'ANY',
      through: [
        {
          kind: 'FIELD',
          fieldUniversalIdentifier: LEGACY_FIELD_UNIVERSAL_IDENTIFIER,
        },
      ],
    });
    expect(await hasLegacyColumn()).toBe(false);
  });

  it('is a no-op when run again on an already migrated instance', async () => {
    const inheritanceBefore = await readInheritance();

    await command.runDataMigration(dataSource);

    expect(await readInheritance()).toEqual(inheritanceBefore);
    expect(await hasLegacyColumn()).toBe(false);
  });
});
