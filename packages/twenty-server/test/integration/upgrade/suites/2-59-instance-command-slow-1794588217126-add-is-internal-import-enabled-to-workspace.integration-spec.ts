import { type QueryRunner } from 'typeorm';

import { AddIsInternalImportEnabledToWorkspaceSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-59/2-59-instance-command-slow-1794588217126-add-is-internal-import-enabled-to-workspace';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

describe('2-59 slow instance command 1794588217126 - AddIsInternalImportEnabledToWorkspaceSlowInstanceCommand (integration)', () => {
  const command =
    new AddIsInternalImportEnabledToWorkspaceSlowInstanceCommand();
  let queryRunner: QueryRunner;

  const findInternalImportFlags = async (): Promise<{
    isInternalMessagesImportEnabled: boolean;
    isInternalImportEnabled: boolean;
  }> => {
    const [workspace] = await queryRunner.query(
      `SELECT "isInternalMessagesImportEnabled", "isInternalImportEnabled"
       FROM "core"."workspace"
       WHERE "id" = $1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    return workspace;
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

  it('adds the column and copies the internal messages import setting into it', async () => {
    await command.down(queryRunner);
    await queryRunner.query(
      `UPDATE "core"."workspace" SET "isInternalMessagesImportEnabled" = true WHERE "id" = $1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    await command.up(queryRunner);

    expect(await findInternalImportFlags()).toEqual({
      isInternalMessagesImportEnabled: true,
      isInternalImportEnabled: true,
    });
  });

  it('keeps the new column off for workspaces that never enabled internal import', async () => {
    await command.down(queryRunner);
    await queryRunner.query(
      `UPDATE "core"."workspace" SET "isInternalMessagesImportEnabled" = false WHERE "id" = $1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    await command.up(queryRunner);

    expect(await findInternalImportFlags()).toEqual({
      isInternalMessagesImportEnabled: false,
      isInternalImportEnabled: false,
    });
  });
});
