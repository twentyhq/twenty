import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In, LessThan } from 'typeorm';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { TRASH_CLEANUP_BATCH_SIZE } from 'src/engine/trash-cleanup/constants/trash-cleanup-batch-size.constant';
import { TRASH_CLEANUP_MAX_RECORDS_PER_WORKSPACE } from 'src/engine/trash-cleanup/constants/trash-cleanup-max-records-per-workspace.constant';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

export type TrashCleanupInput = {
  workspaceId: string;
  trashRetentionDays: number;
};

@Injectable()
export class TrashCleanupService {
  private readonly logger = new Logger(TrashCleanupService.name);
  private readonly maxRecordsPerWorkspace =
    TRASH_CLEANUP_MAX_RECORDS_PER_WORKSPACE;
  private readonly batchSize = TRASH_CLEANUP_BATCH_SIZE;

  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async cleanupWorkspaceTrash(input: TrashCleanupInput): Promise<number> {
    const { workspaceId, trashRetentionDays } = input;

    const { flatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const objectNames = Object.values(flatObjectMetadataMaps.byId ?? {})
      .map((metadata) => metadata?.nameSingular)
      .filter(isDefined);

    if (objectNames.length === 0) {
      this.logger.log(`No objects found in workspace ${workspaceId}`);

      return 0;
    }

    const cutoffDate = this.calculateCutoffDate(trashRetentionDays);
    let deletedCount = 0;

    for (const objectName of objectNames) {
      if (deletedCount >= this.maxRecordsPerWorkspace) {
        this.logger.log(
          `Reached deletion limit (${this.maxRecordsPerWorkspace}) for workspace ${workspaceId}`,
        );
        break;
      }

      const remainingQuota = this.maxRecordsPerWorkspace - deletedCount;
      const deletedForObject = await this.deleteSoftDeletedRecords({
        workspaceId,
        objectName,
        cutoffDate,
        remainingQuota,
      });

      if (deletedForObject > 0) {
        this.logger.log(
          `Deleted ${deletedForObject} record(s) from ${objectName} in workspace ${workspaceId}`,
        );
      }

      deletedCount += deletedForObject;
    }

    this.logger.log(
      `Deleted ${deletedCount} record(s) from workspace ${workspaceId}`,
    );

    return deletedCount;
  }

  private async deleteSoftDeletedRecords({
    workspaceId,
    objectName,
    cutoffDate,
    remainingQuota,
  }: {
    workspaceId: string;
    objectName: string;
    cutoffDate: Date;
    remainingQuota: number;
  }): Promise<number> {
    if (remainingQuota <= 0) {
      return 0;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const repository = await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          objectName,
          { shouldBypassPermissionChecks: true },
        );

        let deleted = 0;

        while (deleted < remainingQuota) {
          const take = Math.min(this.batchSize, remainingQuota - deleted);

          const recordsToDelete = await repository.find({
            withDeleted: true,
            select: ['id'],
            where: {
              deletedAt: LessThan(cutoffDate),
            },
            order: { deletedAt: 'ASC' },
            take,
            loadEagerRelations: false,
          });

          if (recordsToDelete.length === 0) {
            break;
          }

          await repository.delete({
            id: In(recordsToDelete.map((record) => record.id)),
          });

          deleted += recordsToDelete.length;
        }

        return deleted;
      },
    );
  }

  private calculateCutoffDate(trashRetentionDays: number): Date {
    const cutoffDate = new Date();

    cutoffDate.setUTCHours(0, 0, 0, 0);
    cutoffDate.setDate(cutoffDate.getDate() - trashRetentionDays + 1);

    return cutoffDate;
  }
}
