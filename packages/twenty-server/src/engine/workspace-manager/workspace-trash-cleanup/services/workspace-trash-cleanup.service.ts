import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { calculateNextTrashCleanupDate } from 'src/engine/core-modules/workspace/utils/calculate-next-trash-cleanup-date.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceTrashTableDiscoveryService } from 'src/engine/workspace-manager/workspace-trash-cleanup/services/workspace-trash-table-discovery.service';
import { WorkspaceTrashDeletionService } from 'src/engine/workspace-manager/workspace-trash-cleanup/services/workspace-trash-deletion.service';

type WorkspaceForCleanup = Pick<Workspace, 'id' | 'trashRetentionDays'>;

@Injectable()
export class WorkspaceTrashCleanupService {
  private readonly logger = new Logger(WorkspaceTrashCleanupService.name);
  private readonly batchSize: number;
  private readonly delayBetweenBatchesMs: number;

  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly tableDiscoveryService: WorkspaceTrashTableDiscoveryService,
    private readonly deletionService: WorkspaceTrashDeletionService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {
    this.batchSize = this.twentyConfigService.get(
      'TRASH_CLEANUP_WORKSPACE_BATCH_SIZE',
    );
    this.delayBetweenBatchesMs = this.twentyConfigService.get(
      'TRASH_CLEANUP_DELAY_BETWEEN_BATCHES_MS',
    );
  }

  async cleanupWorkspaceTrash(): Promise<void> {
    const workspaces = await this.getWorkspacesDueForCleanup();

    if (workspaces.length === 0) {
      this.logger.log('No workspaces due for trash cleanup');

      return;
    }

    this.logger.log(`Found ${workspaces.length} workspace(s) due for cleanup`);

    const schemaNameMap = this.buildSchemaNameMap(workspaces);
    const schemaNames = Array.from(schemaNameMap.values());

    const tablesBySchema =
      await this.tableDiscoveryService.discoverTablesWithSoftDelete(
        schemaNames,
      );

    const { succeeded, failed, workspacesToUpdate } =
      await this.processWorkspacesInBatches(
        workspaces,
        schemaNameMap,
        tablesBySchema,
      );

    if (workspacesToUpdate.length > 0) {
      await this.updateNextCleanupDates(workspacesToUpdate);
    }

    this.logger.log(
      `Workspace trash cleanup completed. Processed: ${succeeded}, Failed: ${failed}`,
    );
  }

  private async getWorkspacesDueForCleanup(): Promise<WorkspaceForCleanup[]> {
    return await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
        nextTrashCleanupAt: LessThanOrEqual(new Date()),
        trashRetentionDays: MoreThanOrEqual(0),
      },
      select: ['id', 'trashRetentionDays'],
      order: { nextTrashCleanupAt: 'ASC' },
    });
  }

  private buildSchemaNameMap(
    workspaces: WorkspaceForCleanup[],
  ): Map<string, string> {
    const schemaNameMap = new Map<string, string>();

    for (const workspace of workspaces) {
      const schemaName = getWorkspaceSchemaName(workspace.id);

      schemaNameMap.set(workspace.id, schemaName);
    }

    return schemaNameMap;
  }

  private async processWorkspacesInBatches(
    workspaces: WorkspaceForCleanup[],
    schemaNameMap: Map<string, string>,
    tablesBySchema: Map<string, string[]>,
  ): Promise<{
    succeeded: number;
    failed: number;
    workspacesToUpdate: WorkspaceForCleanup[];
  }> {
    const workspacesToUpdate: WorkspaceForCleanup[] = [];
    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < workspaces.length; i += this.batchSize) {
      const batch = workspaces.slice(i, i + this.batchSize);

      const results = await Promise.all(
        batch.map(async (workspace) => {
          const schemaName = schemaNameMap.get(workspace.id)!;
          const tableNames = tablesBySchema.get(schemaName) || [];

          const result = await this.deletionService.deleteSoftDeletedRecords(
            workspace.id,
            schemaName,
            tableNames,
          );

          return { workspace, result };
        }),
      );

      for (const { workspace, result } of results) {
        if (result.success) {
          workspacesToUpdate.push(workspace);
          succeeded++;
        } else {
          failed++;
        }
      }

      if (
        i + this.batchSize < workspaces.length &&
        this.delayBetweenBatchesMs > 0
      ) {
        await this.sleep(this.delayBetweenBatchesMs);
      }
    }

    return { succeeded, failed, workspacesToUpdate };
  }

  private async updateNextCleanupDates(
    workspaces: WorkspaceForCleanup[],
  ): Promise<void> {
    let caseStatement = 'CASE';
    const parameters: Record<string, any> = {};

    for (let i = 0; i < workspaces.length; i++) {
      const workspace = workspaces[i];
      const nextDate = calculateNextTrashCleanupDate(
        workspace.trashRetentionDays,
      );

      caseStatement += ` WHEN id = :id${i} THEN CAST(:date${i} AS TIMESTAMP)`;
      parameters[`id${i}`] = workspace.id;
      parameters[`date${i}`] = nextDate;
    }
    caseStatement += ' END';

    await this.workspaceRepository
      .createQueryBuilder()
      .update(Workspace)
      .set({
        nextTrashCleanupAt: () => caseStatement,
        updatedAt: () => 'CURRENT_TIMESTAMP',
      })
      .where('id IN (:...ids)', { ids: workspaces.map((w) => w.id) })
      .setParameters(parameters)
      .execute();

    this.logger.log(
      `Updated next cleanup dates for ${workspaces.length} workspace(s)`,
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
