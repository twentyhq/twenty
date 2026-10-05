import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { APPROXIMATE_RECORD_COUNT_CACHE_TTL_MS } from 'src/engine/metadata-modules/object-metadata/constants/approximate-record-count-cache-ttl-ms.constant';
import { type ObjectRecordCountDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-record-count.dto';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@Injectable()
export class ObjectRecordCountService {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  // Never-analyzed tables report reltuples as -1
  async getApproximateRecordCountByTableName(
    workspaceId: string,
  ): Promise<Map<string, number>> {
    const schemaName = getWorkspaceSchemaName(workspaceId);

    const rows: { relname: string; approximate_count: number }[] =
      await this.coreDataSource.query(
        `SELECT relname, reltuples::bigint AS approximate_count
         FROM pg_class c
         JOIN pg_namespace n ON c.relnamespace = n.oid
         WHERE n.nspname = $1
         AND c.relkind = 'r'`,
        [schemaName],
      );

    const countByTableName = new Map<string, number>();

    for (const row of rows) {
      countByTableName.set(
        row.relname,
        Math.max(0, Number(row.approximate_count)),
      );
    }

    return countByTableName;
  }

  async getCachedApproximateRecordCountByTableName(
    workspaceId: string,
  ): Promise<Map<string, number>> {
    const cacheKey = `approximate-record-count-by-table-name:${workspaceId}`;

    const cachedCountByTableName =
      await this.cacheStorageService.get<Record<string, number>>(cacheKey);

    if (isDefined(cachedCountByTableName)) {
      return new Map(Object.entries(cachedCountByTableName));
    }

    const countByTableName =
      await this.getApproximateRecordCountByTableName(workspaceId);

    await this.cacheStorageService.set(
      cacheKey,
      Object.fromEntries(countByTableName),
      APPROXIMATE_RECORD_COUNT_CACHE_TTL_MS,
    );

    return countByTableName;
  }

  async getRecordCounts(workspaceId: string): Promise<ObjectRecordCountDTO[]> {
    const { flatObjectMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const flatObjectMetadatas = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const countByTableName =
      await this.getApproximateRecordCountByTableName(workspaceId);

    return flatObjectMetadatas.map((flatObjectMetadata) => ({
      objectNamePlural: flatObjectMetadata.namePlural,
      totalCount:
        countByTableName.get(computeObjectTargetTable(flatObjectMetadata)) ?? 0,
    }));
  }
}
