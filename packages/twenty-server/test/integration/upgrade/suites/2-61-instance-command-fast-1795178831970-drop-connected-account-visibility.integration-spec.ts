import { ConnectedAccountProvider } from 'twenty-shared/types';
import { type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { DropConnectedAccountVisibilityFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-instance-command-fast-1795178831970-drop-connected-account-visibility';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

jest.useRealTimers();

describe('2-61 instance command 1795178831970 - drop connected account visibility (integration)', () => {
  const dropVisibilityCommand =
    new DropConnectedAccountVisibilityFastInstanceCommand();
  let queryRunner: QueryRunner;

  const insertConnectedAccount = async (scope: string): Promise<string> => {
    const id = v4();

    await queryRunner.query(
      `INSERT INTO "core"."connectedAccount"
         ("id", "handle", "provider", "userWorkspaceId", "workspaceId", "scope")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        id,
        `${id}@drop-connected-account-visibility.test`,
        ConnectedAccountProvider.GOOGLE,
        USER_WORKSPACE_DATA_SEED_IDS.JANE,
        SEED_APPLE_WORKSPACE_ID,
        scope,
      ],
    );

    return id;
  };

  const findVisibilityColumns = () =>
    queryRunner.query(
      `SELECT column_name AS "columnName"
         FROM information_schema.columns
        WHERE table_schema = 'core' AND table_name = 'connectedAccount'
          AND column_name = 'visibility'`,
    );

  const findSyncTriggers = () =>
    queryRunner.query(
      `SELECT 1 FROM pg_trigger WHERE tgname = 'syncConnectedAccountScopeAndVisibility'`,
    );

  beforeEach(async () => {
    queryRunner = globalThis.testDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it('drops the visibility column and its sync trigger', async () => {
    expect(await findVisibilityColumns()).toEqual([]);
    expect(await findSyncTriggers()).toEqual([]);
  });

  it('restores visibility from scope on down', async () => {
    const workspaceAccountId = await insertConnectedAccount('WORKSPACE');

    await dropVisibilityCommand.down(queryRunner);

    const [{ visibility }] = await queryRunner.query(
      `SELECT "visibility" FROM "core"."connectedAccount" WHERE "id" = $1`,
      [workspaceAccountId],
    );

    expect(visibility).toBe('workspace');
    expect(await findSyncTriggers()).toHaveLength(1);
  });
});
