import { type QueryRunner } from 'typeorm';

import { AddIsInternalImportEnabledToWorkspaceSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-59/2-59-instance-command-slow-1794588217126-add-is-internal-import-enabled-to-workspace';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

jest.useRealTimers();

describe('2-59 slow instance command 1794588217126 - AddIsInternalImportEnabledToWorkspaceSlowInstanceCommand (integration)', () => {
  let command: AddIsInternalImportEnabledToWorkspaceSlowInstanceCommand;
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
    command = new AddIsInternalImportEnabledToWorkspaceSlowInstanceCommand(
      getAppProviderByClassName<WorkspaceCacheService>('WorkspaceCacheService'),
    );
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

  it('turns the internal import column feature flag on for existing workspaces', async () => {
    await globalThis.testDataSource.query(
      `UPDATE "core"."featureFlag" SET "value" = false WHERE "workspaceId" = $1 AND "key" = 'IS_INTERNAL_IMPORT_COLUMN_ENABLED'`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    await command.runDataMigration(globalThis.testDataSource);

    const [featureFlag] = await globalThis.testDataSource.query(
      `SELECT "value" FROM "core"."featureFlag" WHERE "workspaceId" = $1 AND "key" = 'IS_INTERNAL_IMPORT_COLUMN_ENABLED'`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    expect(featureFlag).toEqual({ value: true });
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
