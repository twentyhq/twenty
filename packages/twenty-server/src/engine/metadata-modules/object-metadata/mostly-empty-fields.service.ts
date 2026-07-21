import { Injectable } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { MOSTLY_EMPTY_MINIMUM_ROW_COUNT } from 'src/engine/metadata-modules/object-metadata/constants/mostly-empty-minimum-row-count.constant';
import { ObjectRecordCountService } from 'src/engine/metadata-modules/object-metadata/object-record-count.service';
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
    private readonly objectRecordCountService: ObjectRecordCountService,
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

    const approximateRecordCountByTableName =
      await this.objectRecordCountService.getApproximateRecordCountByTableName(
        workspaceId,
      );

    const approximateRowCount =
      approximateRecordCountByTableName.get(tableName) ?? 0;

    if (approximateRowCount < MOSTLY_EMPTY_MINIMUM_ROW_COUNT) {
      return [];
    }

    const dataSource =
      await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

    // Per-column emptiness: null fraction plus the sampled frequency of the
    // column type's empty sentinel — '' for text columns (NOT NULL DEFAULT ''),
    // '{}' for arrays, '{}'/'[]' for json. Sentinels are matched per physical
    // column type so a text value that happens to be '{}' does not count
    const columnStatisticsRows: {
      column_name: string;
      empty_fraction: number;
    }[] = await dataSource.query(
      `SELECT s.attname AS column_name,
              (s.null_frac + COALESCE(empty_sentinel.frequency, 0))::float AS empty_fraction
       FROM pg_stats s
       JOIN pg_namespace n ON n.nspname = s.schemaname
       JOIN pg_class c ON c.relnamespace = n.oid AND c.relname = s.tablename
       JOIN pg_attribute a ON a.attrelid = c.oid AND a.attname = s.attname
       JOIN pg_type t ON t.oid = a.atttypid
       LEFT JOIN LATERAL (
         SELECT SUM(most_common_value_frequency) AS frequency
         FROM unnest(s.most_common_vals::text::text[], s.most_common_freqs)
           AS most_common_value_entry(most_common_value, most_common_value_frequency)
         WHERE most_common_value_entry.most_common_value = ANY (
           CASE
             WHEN t.typcategory = 'S' THEN ARRAY['']
             WHEN t.typcategory = 'A' THEN ARRAY['{}']
             WHEN t.typname IN ('json', 'jsonb') THEN ARRAY['{}', '[]']
             ELSE ARRAY[]::text[]
           END
         )
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
    });
  }
}
