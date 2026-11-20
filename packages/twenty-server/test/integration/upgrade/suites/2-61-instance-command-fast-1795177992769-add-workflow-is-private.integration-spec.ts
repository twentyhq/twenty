import { type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { AddWorkflowIsPrivateFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-instance-command-fast-1795177992769-add-workflow-is-private';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

type PrivacyColumns = { isPrivate?: boolean; visibility?: string };

describe('2-61 instance command 1795177992769 - add workflow isPrivate (integration)', () => {
  const addIsPrivateCommand = new AddWorkflowIsPrivateFastInstanceCommand();
  let queryRunner: QueryRunner;

  const restorePreUpgradeSchema = async () => {
    await addIsPrivateCommand.down(queryRunner);
  };

  const insertWorkflow = async (columns: PrivacyColumns): Promise<string> => {
    const id = v4();
    const columnNames = Object.keys(columns);
    const [{ id: applicationId }] = await queryRunner.query(
      `SELECT "id" FROM "core"."application" WHERE "workspaceId" = $1 LIMIT 1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    await queryRunner.query(
      `INSERT INTO "core"."workflow"
         ("id", "universalIdentifier", "applicationId", "workspaceId"${columnNames.map((name) => `, "${name}"`).join('')})
       VALUES ($1, $2, $3, $4${columnNames.map((_, index) => `, $${index + 5}`).join('')})`,
      [
        id,
        v4(),
        applicationId,
        SEED_APPLE_WORKSPACE_ID,
        ...Object.values(columns),
      ],
    );

    return id;
  };

  const findPrivacyColumns = async (id: string): Promise<PrivacyColumns> => {
    const [row] = await queryRunner.query(
      `SELECT "isPrivate", "visibility" FROM "core"."workflow" WHERE "id" = $1`,
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
    await addIsPrivateCommand.up(queryRunner);

    const legacyWriteId = await insertWorkflow({ visibility: 'PRIVATE' });
    const isPrivateWriteId = await insertWorkflow({ isPrivate: true });
    const defaultWriteId = await insertWorkflow({});

    expect(await findPrivacyColumns(legacyWriteId)).toEqual({
      isPrivate: true,
      visibility: 'PRIVATE',
    });
    expect(await findPrivacyColumns(isPrivateWriteId)).toEqual({
      isPrivate: true,
      visibility: 'PRIVATE',
    });
    expect(await findPrivacyColumns(defaultWriteId)).toEqual({
      isPrivate: false,
      visibility: 'WORKSPACE',
    });

    await queryRunner.query(
      `UPDATE "core"."workflow" SET "visibility" = 'WORKSPACE' WHERE "id" = $1`,
      [legacyWriteId],
    );
    await queryRunner.query(
      `UPDATE "core"."workflow" SET "isPrivate" = false WHERE "id" = $1`,
      [isPrivateWriteId],
    );

    expect(await findPrivacyColumns(legacyWriteId)).toEqual({
      isPrivate: false,
      visibility: 'WORKSPACE',
    });
    expect(await findPrivacyColumns(isPrivateWriteId)).toEqual({
      isPrivate: false,
      visibility: 'WORKSPACE',
    });
  });

  it('copies the visibility of workflows created before the upgrade into isPrivate', async () => {
    await restorePreUpgradeSchema();

    const privateWorkflowId = await insertWorkflow({ visibility: 'PRIVATE' });
    const workspaceWorkflowId = await insertWorkflow({
      visibility: 'WORKSPACE',
    });

    await addIsPrivateCommand.up(queryRunner);

    expect(await findPrivacyColumns(privateWorkflowId)).toEqual({
      isPrivate: true,
      visibility: 'PRIVATE',
    });
    expect(await findPrivacyColumns(workspaceWorkflowId)).toEqual({
      isPrivate: false,
      visibility: 'WORKSPACE',
    });
  });

  it('restores the previous schema on down', async () => {
    await restorePreUpgradeSchema();

    const columns = await queryRunner.query(
      `SELECT column_name AS "columnName", column_default AS "columnDefault"
         FROM information_schema.columns
        WHERE table_schema = 'core' AND table_name = 'workflow'
          AND column_name IN ('isPrivate', 'visibility')`,
    );
    const syncTriggers = await queryRunner.query(
      `SELECT 1 FROM pg_trigger WHERE tgname = 'syncWorkflowIsPrivateAndVisibility'`,
    );

    expect(columns).toEqual([
      {
        columnName: 'visibility',
        columnDefault: "'WORKSPACE'::character varying",
      },
    ]);
    expect(syncTriggers).toEqual([]);
  });
});
