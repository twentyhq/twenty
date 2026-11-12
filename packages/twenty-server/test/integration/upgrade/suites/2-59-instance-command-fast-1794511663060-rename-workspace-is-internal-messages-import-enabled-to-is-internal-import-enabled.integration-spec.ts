import { type QueryRunner } from 'typeorm';

import { RenameWorkspaceIsInternalMessagesImportEnabledToIsInternalImportEnabledFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-59/2-59-instance-command-fast-1794511663060-rename-workspace-is-internal-messages-import-enabled-to-is-internal-import-enabled';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

describe('2-59 fast instance command 1794511663060 -RenameWorkspaceIsInternalMessagesImportEnabledToIsInternalImportEnabledFastInstanceCommand (integration)', () => {
  const command =
    new RenameWorkspaceIsInternalMessagesImportEnabledToIsInternalImportEnabledFastInstanceCommand();
  let queryRunner: QueryRunner;

  const findInternalImportColumns = async (): Promise<string[]> => {
    const rows: { columnName: string }[] = await queryRunner.query(
      `SELECT column_name AS "columnName"
       FROM information_schema.columns
       WHERE table_schema = 'core'
         AND table_name = 'workspace'
         AND column_name IN ('isInternalMessagesImportEnabled', 'isInternalImportEnabled')`,
    );

    return rows.map(({ columnName }) => columnName);
  };

  beforeEach(async () => {
    queryRunner =
      global.workflowTestServices.coreDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it('renames the column and keeps each workspace value', async () => {
    await command.down(queryRunner);
    await queryRunner.query(
      `UPDATE "core"."workspace" SET "isInternalMessagesImportEnabled" = true WHERE "id" = $1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    await command.up(queryRunner);

    expect(await findInternalImportColumns()).toEqual([
      'isInternalImportEnabled',
    ]);

    const [workspace]: { isInternalImportEnabled: boolean }[] =
      await queryRunner.query(
        `SELECT "isInternalImportEnabled" FROM "core"."workspace" WHERE "id" = $1`,
        [SEED_APPLE_WORKSPACE_ID],
      );

    expect(workspace.isInternalImportEnabled).toBe(true);
  });

  it('is a no-op when the column was already renamed', async () => {
    await command.up(queryRunner);

    expect(await findInternalImportColumns()).toEqual([
      'isInternalImportEnabled',
    ]);
  });
});
