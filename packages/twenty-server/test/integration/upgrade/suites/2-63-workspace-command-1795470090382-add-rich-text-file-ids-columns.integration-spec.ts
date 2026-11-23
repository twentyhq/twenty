import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AddRichTextFileIdsColumnsCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-workspace-command-1795470090382-add-rich-text-file-ids-columns.command';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const findFileIdsColumnDataTypes = async (
  tableName: string,
): Promise<string[]> => {
  const rows: { dataType: string }[] = await global.testDataSource.query(
    `SELECT data_type AS "dataType"
     FROM information_schema.columns
     WHERE table_schema = $1 AND table_name = $2 AND column_name = 'bodyV2_fileIds'`,
    [SCHEMA, tableName],
  );

  return rows.map(({ dataType }) => dataType);
};

const dropFileIdsColumn = (tableName: string) =>
  global.testDataSource.query(
    `ALTER TABLE "${SCHEMA}"."${tableName}" DROP COLUMN IF EXISTS "bodyV2_fileIds"`,
  );

describe('2-63 workspace command - add rich text fileIds columns (integration)', () => {
  let command: AddRichTextFileIdsColumnsCommand;

  const runOnWorkspace = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
      dataSource: global.testDataSource,
    });

  beforeAll(async () => {
    command = await getAppProviderByClassName<AddRichTextFileIdsColumnsCommand>(
      'AddRichTextFileIdsColumnsCommand',
    );
  });

  it('should add the column to existing rich text fields and be re-runnable', async () => {
    await dropFileIdsColumn('note');
    await dropFileIdsColumn('task');

    await runOnWorkspace({ dryRun: true });

    expect(await findFileIdsColumnDataTypes('note')).toEqual([]);

    await runOnWorkspace();
    await runOnWorkspace();

    expect(await findFileIdsColumnDataTypes('note')).toEqual(['jsonb']);
    expect(await findFileIdsColumnDataTypes('task')).toEqual(['jsonb']);
  });
});
