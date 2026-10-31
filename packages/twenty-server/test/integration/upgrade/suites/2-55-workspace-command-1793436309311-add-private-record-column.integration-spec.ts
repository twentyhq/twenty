import { randomUUID } from 'node:crypto';

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AddPrivateRecordColumnCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793436309311-add-private-record-column.command';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

type ColumnRow = {
  tableName: string;
  dataType: string;
  isNullable: string;
  columnDefault: string | null;
};

describe('2-55 workspace command - add private record column (integration)', () => {
  let command: AddPrivateRecordColumnCommand;
  let personObjectMetadataId: string;
  let restrictedPersonId: string;
  let viewOnlyPersonId: string;

  const runOnWorkspace = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
      dataSource: global.testDataSource,
    });

  const findColumns = (): Promise<ColumnRow[]> =>
    global.testDataSource.query(
      `SELECT table_name AS "tableName", udt_name AS "dataType",
              is_nullable AS "isNullable", column_default AS "columnDefault"
       FROM information_schema.columns
       WHERE table_schema = $1 AND column_name = '_isPrivate'
       ORDER BY table_name`,
      [SCHEMA],
    );

  const insertEveryoneShare = ({
    recordId,
    accessLevel,
  }: {
    recordId: string;
    accessLevel: string;
  }) =>
    global.testDataSource.query(
      `INSERT INTO "${SCHEMA}"."recordShare"
         ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
       VALUES ($1, $2, $3, 'EVERYONE', $4, 'MANUAL', $2)`,
      [personObjectMetadataId, recordId, EVERYONE_PRINCIPAL_ID, accessLevel],
    );

  const findPrivatePersonIds = async (): Promise<string[]> =>
    (
      await global.testDataSource.query(
        `SELECT id FROM "${SCHEMA}"."person" WHERE "_isPrivate"`,
      )
    ).map(({ id }: { id: string }) => id);

  const countEveryoneShares = async (): Promise<number> => {
    const [{ count }] = await global.testDataSource.query(
      `SELECT COUNT(*) AS count FROM "${SCHEMA}"."recordShare"
         WHERE "objectMetadataId" = $1 AND "principalType" = 'EVERYONE' AND "recordId" = ANY($2)`,
      [personObjectMetadataId, [restrictedPersonId, viewOnlyPersonId]],
    );

    return Number(count);
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<AddPrivateRecordColumnCommand>(
      'AddPrivateRecordColumnCommand',
    );

    [{ id: personObjectMetadataId }] = await global.testDataSource.query(
      `SELECT id FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = 'person'`,
      [SEED_APPLE_WORKSPACE_ID],
    );
    restrictedPersonId = randomUUID();
    viewOnlyPersonId = randomUUID();
    await global.testDataSource.query(
      `INSERT INTO "${SCHEMA}"."person" (id) VALUES ($1), ($2)`,
      [restrictedPersonId, viewOnlyPersonId],
    );
  });

  afterAll(async () => {
    await global.testDataSource.query(
      `DELETE FROM "${SCHEMA}"."person" WHERE id = ANY($1)`,
      [[restrictedPersonId, viewOnlyPersonId]],
    );
  });

  it('creates the column on standard and custom objects, not on permission storage', async () => {
    const columns = await findColumns();

    for (const tableName of ['person', '_pet']) {
      expect(columns).toContainEqual({
        tableName,
        dataType: 'bool',
        isNullable: 'NO',
        columnDefault: 'false',
      });
    }
    expect(
      columns.filter(({ tableName }) =>
        ['recordShare', 'accessGroup'].includes(tableName),
      ),
    ).toEqual([]);

    const [{ definition }] = await global.testDataSource.query(
      `SELECT pg_get_indexdef(i.indexrelid) AS definition
         FROM pg_index i
         JOIN pg_class c ON c.oid = i.indexrelid
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = $1 AND c.relname = $2`,
      [
        SCHEMA,
        `IDX_PRIVATE_RECORD_${personObjectMetadataId.replace(/-/g, '')}`,
      ],
    );

    expect(definition).toContain('WHERE "_isPrivate"');
  });

  it('adds a missing column back, but not on a dry run', async () => {
    await global.testDataSource.query(
      `ALTER TABLE "${SCHEMA}"."_pet" DROP COLUMN "_isPrivate"`,
    );

    await runOnWorkspace({ dryRun: true });
    expect(
      (await findColumns()).some(({ tableName }) => tableName === '_pet'),
    ).toBe(false);

    await runOnWorkspace();
    await runOnWorkspace();
    expect(
      (await findColumns()).filter(({ tableName }) => tableName === '_pet'),
    ).toHaveLength(1);
  });

  it('turns records restricted to the people with access into private records and drops view-only restrictions', async () => {
    await insertEveryoneShare({
      recordId: restrictedPersonId,
      accessLevel: 'NONE',
    });
    await insertEveryoneShare({
      recordId: viewOnlyPersonId,
      accessLevel: 'READ',
    });

    await runOnWorkspace({ dryRun: true });
    expect(await findPrivatePersonIds()).toEqual([]);

    await runOnWorkspace();

    expect(await findPrivatePersonIds()).toEqual([restrictedPersonId]);
    expect(await countEveryoneShares()).toBe(0);
  });
});
