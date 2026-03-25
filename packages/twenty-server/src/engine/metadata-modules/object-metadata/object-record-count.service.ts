import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type ObjectRecordCountDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-record-count.dto';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@Injectable()
export class ObjectRecordCountService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

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

    const schemaName = getWorkspaceSchemaName(workspaceId);

    const dataSource =
      await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

    const rows: { relname: string; approximate_count: number }[] =
      await dataSource.query(
        `SELECT relname, reltuples::bigint AS approximate_count
         FROM pg_class c
         JOIN pg_namespace n ON c.relnamespace = n.oid
         WHERE n.nspname = $1
         AND c.relkind = 'r'`,
        [schemaName],
        undefined,
        { shouldBypassPermissionChecks: true },
      );

    const countByTableName = new Map<string, number>();

    for (const row of rows) {
      countByTableName.set(
        row.relname,
        Math.max(0, Number(row.approximate_count)),
      );
    }

    return flatObjectMetadatas.map((flatObjectMetadata) => ({
      objectNamePlural: flatObjectMetadata.namePlural,
      totalCount:
        countByTableName.get(
          computeTableName(
            flatObjectMetadata.nameSingular,
            flatObjectMetadata.isCustom,
          ),
        ) ?? 0,
    }));
  }
}
