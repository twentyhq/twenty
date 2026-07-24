import { type NestExpressApplication } from '@nestjs/platform-express';

import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

import { createApp } from 'test/integration/utils/create-app';

import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

jest.useRealTimers();

config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

const buildWorkflowVersion = (): WorkflowVersionWorkspaceEntity =>
  ({
    id: uuidv4(),
    workflowId: uuidv4(),
    coreWorkflowVersionId: null,
    name: 'v1',
    trigger: {
      name: 'Manual Trigger',
      type: 'MANUAL',
      settings: { outputSchema: {} },
      nextStepIds: [],
      position: { x: 0, y: 0 },
    },
    steps: [
      {
        id: uuidv4(),
        name: 'Code',
        type: 'CODE',
        valid: true,
        settings: {},
        nextStepIds: [],
      },
    ],
    status: 'DRAFT',
  }) as unknown as WorkflowVersionWorkspaceEntity;

describe('WorkflowVersionCoreSyncService.mirrorWorkflowVersionWrite (integration)', () => {
  let app: NestExpressApplication;
  let service: WorkflowVersionCoreSyncService;
  let globalWorkspaceOrmManager: GlobalWorkspaceOrmManager;

  const workspaceId = SEED_APPLE_WORKSPACE_ID;

  beforeAll(async () => {
    app = await createApp();
    service = app.get(WorkflowVersionCoreSyncService);
    globalWorkspaceOrmManager = app.get(GlobalWorkspaceOrmManager);
  });

  afterAll(async () => {
    await app.close();
  });

  it('writes the core mirror row inside the caller transaction and rolls it back with it', async () => {
    const workflowVersion = buildWorkflowVersion();

    await globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const dataSource =
        await globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();
      const queryRunner = dataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      let coreWorkflowVersionId: string | undefined;

      try {
        const mirrorResult = await service.mirrorWorkflowVersionWrite({
          workspaceId,
          entityManager: queryRunner.manager as WorkspaceEntityManager,
          workflowVersion,
        });

        expect(mirrorResult).not.toBeNull();

        coreWorkflowVersionId = mirrorResult?.coreWorkflowVersionId;

        const [rowInTransaction] = await queryRunner.manager.query(
          `SELECT "id", "triggers", "steps" FROM core."workflowVersion" WHERE "id" = $1`,
          [coreWorkflowVersionId],
        );

        expect(rowInTransaction).toBeDefined();
        // jsonb must decode to native array/object, not a double-encoded string
        expect(Array.isArray(rowInTransaction.triggers)).toBe(true);
        expect(rowInTransaction.triggers[0].type).toBe('MANUAL');
        expect(Array.isArray(rowInTransaction.steps)).toBe(true);
        expect(rowInTransaction.steps[0].type).toBe('CODE');
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }

      const rowsAfterRollback = await dataSource.query(
        `SELECT "id" FROM core."workflowVersion" WHERE "id" = $1`,
        [coreWorkflowVersionId],
      );

      expect(rowsAfterRollback).toHaveLength(0);
    }, buildSystemAuthContext(workspaceId));
  });

  it('commits the core mirror row when the caller commits', async () => {
    const workflowVersion = buildWorkflowVersion();

    const coreWorkflowVersionId =
      await globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
        const dataSource =
          await globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();
        const queryRunner = dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          const result = await service.mirrorWorkflowVersionWrite({
            workspaceId,
            entityManager: queryRunner.manager as WorkspaceEntityManager,
            workflowVersion,
          });

          expect(result).not.toBeNull();

          await queryRunner.commitTransaction();

          return result?.coreWorkflowVersionId;
        } catch (error) {
          await queryRunner.rollbackTransaction();
          throw error;
        } finally {
          await queryRunner.release();
        }
      }, buildSystemAuthContext(workspaceId));

    const dataSource =
      await globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

    try {
      const [committedRow] = await dataSource.query(
        `SELECT "id", "workflowId" FROM core."workflowVersion" WHERE "id" = $1`,
        [coreWorkflowVersionId],
      );

      expect(committedRow).toBeDefined();
      expect(committedRow.workflowId).toBe(workflowVersion.workflowId);
    } finally {
      await dataSource.query(
        `DELETE FROM core."workflowVersion" WHERE "id" = $1`,
        [coreWorkflowVersionId],
      );
    }
  });
});
