import { ConnectedAccountProvider } from 'twenty-shared/types';
import { type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { AddConnectedAccountScopeFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-49/2-49-instance-command-fast-1792170228100-add-connected-account-scope';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

jest.useRealTimers();

type ScopeColumns = { scope?: string | null; visibility?: string };

describe('2-49 instance command 1792170228100 - add connected account scope (integration)', () => {
  const addScopeCommand = new AddConnectedAccountScopeFastInstanceCommand();
  let queryRunner: QueryRunner;

  const restorePreUpgradeSchema = async () => {
    await addScopeCommand.down(queryRunner);
  };

  const insertConnectedAccount = async (
    columns: ScopeColumns,
  ): Promise<string> => {
    const id = v4();
    const columnNames = Object.keys(columns);

    await queryRunner.query(
      `INSERT INTO "core"."connectedAccount"
         ("id", "handle", "provider", "userWorkspaceId", "workspaceId"${columnNames.map((name) => `, "${name}"`).join('')})
       VALUES ($1, $2, $3, $4, $5${columnNames.map((_, index) => `, $${index + 6}`).join('')})`,
      [
        id,
        `${id}@connected-account-scope.test`,
        ConnectedAccountProvider.GOOGLE,
        USER_WORKSPACE_DATA_SEED_IDS.JANE,
        SEED_APPLE_WORKSPACE_ID,
        ...Object.values(columns),
      ],
    );

    return id;
  };

  const findScopeColumns = async (id: string): Promise<ScopeColumns> => {
    const [row] = await queryRunner.query(
      `SELECT "scope", "visibility" FROM "core"."connectedAccount" WHERE "id" = $1`,
      [id],
    );

    return row;
  };

  beforeEach(async () => {
    queryRunner = globalThis.testDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it('mirrors writes from either release into the other column', async () => {
    await restorePreUpgradeSchema();
    await addScopeCommand.up(queryRunner);

    const legacyWriteId = await insertConnectedAccount({
      visibility: 'workspace',
    });
    const scopeWriteId = await insertConnectedAccount({ scope: 'WORKSPACE' });
    const defaultWriteId = await insertConnectedAccount({});

    expect(await findScopeColumns(legacyWriteId)).toEqual({
      scope: 'WORKSPACE',
      visibility: 'workspace',
    });
    expect(await findScopeColumns(scopeWriteId)).toEqual({
      scope: 'WORKSPACE',
      visibility: 'workspace',
    });
    expect(await findScopeColumns(defaultWriteId)).toEqual({
      scope: 'USER',
      visibility: 'user',
    });

    await queryRunner.query(
      `UPDATE "core"."connectedAccount" SET "visibility" = 'user' WHERE "id" = $1`,
      [legacyWriteId],
    );
    await queryRunner.query(
      `UPDATE "core"."connectedAccount" SET "scope" = 'USER' WHERE "id" = $1`,
      [scopeWriteId],
    );

    expect(await findScopeColumns(legacyWriteId)).toEqual({
      scope: 'USER',
      visibility: 'user',
    });
    expect(await findScopeColumns(scopeWriteId)).toEqual({
      scope: 'USER',
      visibility: 'user',
    });
  });

  it('copies the visibility of connections created before the upgrade into scope', async () => {
    await restorePreUpgradeSchema();

    const userAccountId = await insertConnectedAccount({ visibility: 'user' });
    const workspaceAccountId = await insertConnectedAccount({
      visibility: 'workspace',
    });

    await addScopeCommand.up(queryRunner);

    expect(await findScopeColumns(userAccountId)).toEqual({
      scope: 'USER',
      visibility: 'user',
    });
    expect(await findScopeColumns(workspaceAccountId)).toEqual({
      scope: 'WORKSPACE',
      visibility: 'workspace',
    });
  });

  it('restores the previous schema on down', async () => {
    await restorePreUpgradeSchema();

    const columns = await queryRunner.query(
      `SELECT column_name AS "columnName", column_default AS "columnDefault"
         FROM information_schema.columns
        WHERE table_schema = 'core' AND table_name = 'connectedAccount'
          AND column_name IN ('scope', 'visibility')`,
    );
    const syncTriggers = await queryRunner.query(
      `SELECT 1 FROM pg_trigger WHERE tgname = 'syncConnectedAccountScopeAndVisibility'`,
    );

    expect(columns).toEqual([
      { columnName: 'visibility', columnDefault: "'user'::character varying" },
    ]);
    expect(syncTriggers).toEqual([]);
  });
});
