import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type ProvisionRichTextFilesColumnsCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795707939505-provision-rich-text-files-columns.command';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const findBodyFileColumns = async (
  tableName: string,
): Promise<{ columnName: string; dataType: string }[]> =>
  global.testDataSource.query(
    `SELECT column_name AS "columnName", data_type AS "dataType"
     FROM information_schema.columns
     WHERE table_schema = $1 AND table_name = $2 AND (column_name = 'bodyV2Files' OR column_name LIKE '%\\_fileIds')
     ORDER BY column_name`,
    [SCHEMA, tableName],
  );

const restoreStateBeforeCommand = (tableName: string) =>
  global.testDataSource.query(
    `ALTER TABLE "${SCHEMA}"."${tableName}" DROP COLUMN IF EXISTS "bodyV2Files", ADD COLUMN IF NOT EXISTS "bodyV2_fileIds" jsonb`,
  );

describe('2-65 workspace command - provision rich text files columns (integration)', () => {
  let command: ProvisionRichTextFilesColumnsCommand;

  const runOnWorkspace = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
      dataSource: global.testDataSource,
    });

  beforeAll(async () => {
    command =
      await getAppProviderByClassName<ProvisionRichTextFilesColumnsCommand>(
        'ProvisionRichTextFilesColumnsCommand',
      );
  });

  it('should add the files column to existing rich text fields, drop every fileIds column and be re-runnable', async () => {
    await restoreStateBeforeCommand('note');
    await restoreStateBeforeCommand('task');

    await global.testDataSource.query(
      `ALTER TABLE "${SCHEMA}"."note" ADD COLUMN IF NOT EXISTS "renamedField_fileIds" jsonb`,
    );

    await runOnWorkspace({ dryRun: true });

    expect(await findBodyFileColumns('note')).toEqual([
      { columnName: 'bodyV2_fileIds', dataType: 'jsonb' },
      { columnName: 'renamedField_fileIds', dataType: 'jsonb' },
    ]);

    await runOnWorkspace();
    await runOnWorkspace();

    expect(await findBodyFileColumns('note')).toEqual([
      { columnName: 'bodyV2Files', dataType: 'jsonb' },
    ]);
    expect(await findBodyFileColumns('task')).toEqual([
      { columnName: 'bodyV2Files', dataType: 'jsonb' },
    ]);
  });
});
