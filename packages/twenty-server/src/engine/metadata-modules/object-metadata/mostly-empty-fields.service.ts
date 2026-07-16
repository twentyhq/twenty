import { Injectable } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { MOSTLY_EMPTY_MINIMUM_ROW_COUNT } from 'src/engine/metadata-modules/object-metadata/constants/mostly-empty-field.constants';
import { computeMostlyEmptyFieldMetadataIds } from 'src/engine/metadata-modules/object-metadata/utils/compute-mostly-empty-field-metadata-ids.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

// Detects fields that are empty in almost all records of an object, reading
// Postgres planner statistics (pg_class / pg_stats) instead of scanning the
// table: cost is a catalog lookup regardless of table size, at the price of
// approximate results — acceptable for a settings-page hint
@Injectable()
export class MostlyEmptyFieldsService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async getMostlyEmptyFieldMetadataIds({
    workspaceId,
    objectMetadataId,
  }: {
    workspaceId: string;
    objectMetadataId: string;
  }): Promise<string[]> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const tableName = computeObjectTargetTable(flatObjectMetadata);

    const dataSource =
      await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

    // reltuples is the planner's row estimate, refreshed by autovacuum's
    // ANALYZE; -1 means the table was never analyzed, so we know nothing
    const tableStatisticsRows: { approximate_row_count: string }[] =
      await dataSource.query(
        `SELECT c.reltuples::bigint AS approximate_row_count
         FROM pg_class c
         JOIN pg_namespace n ON c.relnamespace = n.oid
         WHERE n.nspname = $1
         AND c.relname = $2
         AND c.relkind = 'r'`,
        [schemaName, tableName],
        undefined,
        { shouldBypassPermissionChecks: true },
      );

    const approximateRowCount = Number(
      tableStatisticsRows[0]?.approximate_row_count ?? -1,
    );

    if (approximateRowCount < MOSTLY_EMPTY_MINIMUM_ROW_COUNT) {
      return [];
    }

    // Per-column emptiness: null fraction plus the sampled frequency of the
    // type's empty sentinel — '' for text columns (NOT NULL DEFAULT ''),
    // '{}'/'[]' for array and json columns
    const columnStatisticsRows: {
      column_name: string;
      empty_fraction: number;
    }[] = await dataSource.query(
      `SELECT s.attname AS column_name,
              (s.null_frac + COALESCE(empty_sentinel.frequency, 0))::float AS empty_fraction
       FROM pg_stats s
       LEFT JOIN LATERAL (
         SELECT SUM(most_common_value_frequency) AS frequency
         FROM unnest(s.most_common_vals::text::text[], s.most_common_freqs)
           AS most_common_value_entry(most_common_value, most_common_value_frequency)
         WHERE most_common_value_entry.most_common_value IN ('', '{}', '[]')
       ) empty_sentinel ON TRUE
       WHERE s.schemaname = $1
       AND s.tablename = $2
       AND NOT s.inherited`,
      [schemaName, tableName],
      undefined,
      { shouldBypassPermissionChecks: true },
    );

    const emptyFractionByColumnName = new Map(
      columnStatisticsRows.map((row) => [
        row.column_name,
        Number(row.empty_fraction),
      ]),
    );

    const flatFieldMetadatas = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityIds: flatObjectMetadata.fieldIds,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    return computeMostlyEmptyFieldMetadataIds({
      fieldMetadatas: flatFieldMetadatas,
      labelIdentifierFieldMetadataId:
        flatObjectMetadata.labelIdentifierFieldMetadataId,
      emptyFractionByColumnName,
      now: new Date(),
    });
  }
}
