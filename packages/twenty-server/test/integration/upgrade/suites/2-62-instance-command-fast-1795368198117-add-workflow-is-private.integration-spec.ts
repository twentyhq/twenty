import { type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { AddWorkflowIsPrivateFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-62/2-62-instance-command-fast-1795368198117-add-workflow-is-private';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

type PrivacyColumns = { isPrivate?: boolean; visibility?: string };

describe('2-62 instance command 1795368198117 - add workflow isPrivate (integration)', () => {
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

  it('copies the visibility of existing workflows into isPrivate', async () => {
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

  it('defaults isPrivate to false for workflows created after the upgrade', async () => {
    await restorePreUpgradeSchema();
    await addIsPrivateCommand.up(queryRunner);

    const workflowId = await insertWorkflow({});

    expect(await findPrivacyColumns(workflowId)).toEqual({
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

    expect(columns).toEqual([
      {
        columnName: 'visibility',
        columnDefault: "'WORKSPACE'::character varying",
      },
    ]);
  });
});
