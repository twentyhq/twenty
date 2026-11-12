/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { ACCESS_GROUP_PROPAGATION_PROGRESS_STALE_AFTER_MS } from 'src/engine/permissions/internal/access-group/constants/access-group-propagation-progress-stale-after-ms.constant';
import { ACCESS_GROUP_PROPAGATION_PROGRESS_SYNC_UNIT } from 'src/engine/permissions/internal/access-group/constants/access-group-propagation-progress-sync-unit.constant';
import { APPLY_ACCESS_GROUP_PROPAGATION_PROGRESS_SCRIPT } from 'src/engine/permissions/internal/access-group/constants/apply-access-group-propagation-progress-script.constant';
import { type AccessGroupPropagationProgress } from 'src/engine/permissions/internal/access-group/types/access-group-propagation-progress.type';
import { type RecomputeRecordAccessGroupIdsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-record-access-group-ids-job-data.type';
import { computeAccessGroupPropagationProgress } from 'src/engine/permissions/internal/access-group/utils/compute-access-group-propagation-progress.util';
import { RecordAccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-access-group.repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type ProgressUpdate = {
  command: 'HSET' | 'HINCRBY';
  field: 'total' | 'remaining';
  value: number;
};

@Injectable()
export class AccessGroupPropagationProgressService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EnginePermissions)
    private readonly cacheStorageService: CacheStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordAccessGroupRepository: RecordAccessGroupRepository,
  ) {}

  async findProgress(
    workspaceId: string,
  ): Promise<AccessGroupPropagationProgress> {
    return computeAccessGroupPropagationProgress(
      await this.runProgressScript({ workspaceId, updateArgs: [] }),
    );
  }

  async addPendingSync(workspaceId: string): Promise<void> {
    await this.applyUpdates({
      workspaceId,
      unit: ACCESS_GROUP_PROPAGATION_PROGRESS_SYNC_UNIT,
      updates: [{ command: 'HINCRBY', field: 'remaining', value: 1 }],
    });
  }

  async removePendingSync(workspaceId: string): Promise<void> {
    await this.applyUpdates({
      workspaceId,
      unit: ACCESS_GROUP_PROPAGATION_PROGRESS_SYNC_UNIT,
      updates: [{ command: 'HINCRBY', field: 'remaining', value: -1 }],
    });
  }

  // Estimated so scheduling never scans the table, the job counts it exactly when it starts
  async trackScheduledObjectRecompute(
    jobData: RecomputeRecordAccessGroupIdsJobData,
  ): Promise<void> {
    await this.setObjectRecordCount({
      jobData,
      countRecords: (countArgs) =>
        this.recordAccessGroupRepository.estimateRecordCount(countArgs),
    });
  }

  async trackStartedObjectRecompute(
    jobData: RecomputeRecordAccessGroupIdsJobData,
  ): Promise<number> {
    return this.setObjectRecordCount({
      jobData,
      countRecords: (countArgs) =>
        this.recordAccessGroupRepository.countRecords(countArgs),
    });
  }

  // Sets rather than adds, so a deduplicated job or a retry never counts an object twice
  private async setObjectRecordCount({
    jobData,
    countRecords,
  }: {
    jobData: RecomputeRecordAccessGroupIdsJobData;
    countRecords: (countArgs: {
      workspaceId: string;
      flatObjectMetadata: FlatObjectMetadata;
    }) => Promise<number>;
  }): Promise<number> {
    const { workspaceId, objectMetadataId } = jobData;
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      return 0;
    }

    const recordCount = await countRecords({ workspaceId, flatObjectMetadata });
    // An empty table still holds one record, so its object stays pending until its job settles it
    const remainingRecordCount = Math.max(1, recordCount);

    await this.applyUpdates({
      workspaceId,
      unit: this.buildObjectUnit(jobData),
      updates: [
        { command: 'HSET', field: 'total', value: recordCount },
        { command: 'HSET', field: 'remaining', value: remainingRecordCount },
      ],
    });

    return remainingRecordCount;
  }

  async trackRecomputedRecords({
    recordCount,
    ...jobData
  }: RecomputeRecordAccessGroupIdsJobData & {
    recordCount: number;
  }): Promise<void> {
    await this.applyUpdates({
      workspaceId: jobData.workspaceId,
      unit: this.buildObjectUnit(jobData),
      updates: [
        { command: 'HINCRBY', field: 'remaining', value: -recordCount },
      ],
    });
  }

  async abandonObjectRecompute(
    jobData: RecomputeRecordAccessGroupIdsJobData,
  ): Promise<void> {
    await this.applyUpdates({
      workspaceId: jobData.workspaceId,
      unit: this.buildObjectUnit(jobData),
      updates: [{ command: 'HSET', field: 'remaining', value: 0 }],
    });
  }

  // Mirrors the deduplication id of the job, the two recomputes of an object run apart
  private buildObjectUnit({
    objectMetadataId,
    propagatedFromObjectMetadataIds,
  }: RecomputeRecordAccessGroupIdsJobData): string {
    return isNonEmptyArray(propagatedFromObjectMetadataIds)
      ? `${objectMetadataId}:propagated`
      : objectMetadataId;
  }

  private applyUpdates({
    workspaceId,
    unit,
    updates,
  }: {
    workspaceId: string;
    unit: string;
    updates: ProgressUpdate[];
  }): Promise<Record<string, string>> {
    return this.runProgressScript({
      workspaceId,
      updateArgs: [
        ...updates.flatMap(({ command, field, value }) => [
          command,
          `${field}:${unit}`,
          String(value),
        ]),
        'HSET',
        `touchedAt:${unit}`,
        String(Date.now()),
      ],
    });
  }

  private async runProgressScript({
    workspaceId,
    updateArgs,
  }: {
    workspaceId: string;
    updateArgs: string[];
  }): Promise<Record<string, string>> {
    const fields = await this.cacheStorageService.runScript<string[]>({
      script: APPLY_ACCESS_GROUP_PROPAGATION_PROGRESS_SCRIPT,
      keys: [`access-group-propagation-progress:${workspaceId}`],
      args: [
        String(Date.now()),
        String(ACCESS_GROUP_PROPAGATION_PROGRESS_STALE_AFTER_MS),
        ...updateArgs,
      ],
    });
    const progressFields: Record<string, string> = {};

    for (let index = 0; index < fields.length; index += 2) {
      progressFields[fields[index]] = fields[index + 1];
    }

    return progressFields;
  }
}
