/* @license Enterprise */

import { isObject } from '@sniptt/guards';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type PermissionsMetadataMaps,
  type RowAccessEvaluationContext,
} from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { findRelationJoinColumnsOrThrow } from 'src/engine/permissions/internal/rls/utils/find-relation-join-columns-or-throw.util';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/permissions/internal/rls/utils/render-row-level-permission-filter-to-sql.util';

const RELATION_TARGET_TABLE_ALIAS = 'relationTarget';

export const resolveRelationsInRecordFilter = async ({
  recordFilter,
  flatObjectMetadata,
  records,
  metadataMaps,
  findRelationJoinValues,
}: {
  recordFilter: RecordGqlOperationFilter;
  flatObjectMetadata: FlatObjectMetadata;
  records: object[];
  metadataMaps: Pick<
    PermissionsMetadataMaps,
    'flatFieldMetadataMaps' | 'flatObjectMetadataMaps'
  >;
  findRelationJoinValues: RowAccessEvaluationContext['findRelationJoinValues'];
}): Promise<RecordGqlOperationFilter> => {
  const { flatFieldMetadataMaps, flatObjectMetadataMaps } = metadataMaps;
  const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
    flatFieldMetadataMaps,
    flatObjectMetadata,
  );

  const resolveFilter = async (
    filter: RecordGqlOperationFilter,
  ): Promise<RecordGqlOperationFilter> => {
    const entries = await Promise.all(
      Object.entries(filter).map(async ([filterKey, filterValue]) => {
        if (filterKey === 'and' || filterKey === 'or') {
          return [
            filterKey,
            await Promise.all(
              (filterValue as RecordGqlOperationFilter[]).map(resolveFilter),
            ),
          ];
        }

        if (filterKey === 'not') {
          return [
            filterKey,
            await resolveFilter(filterValue as RecordGqlOperationFilter),
          ];
        }

        const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldIdByName[filterKey] ?? '',
          flatEntityMaps: flatFieldMetadataMaps,
        });
        const targetFlatObjectMetadata = isDefined(
          fieldMetadata?.relationTargetObjectMetadataId,
        )
          ? findFlatEntityByIdInFlatEntityMaps({
              flatEntityId: fieldMetadata.relationTargetObjectMetadataId,
              flatEntityMaps: flatObjectMetadataMaps,
            })
          : undefined;

        if (
          !isDefined(fieldMetadata) ||
          !isMorphOrRelationFlatFieldMetadata(fieldMetadata) ||
          !isDefined(targetFlatObjectMetadata) ||
          !isObject(filterValue)
        ) {
          return [filterKey, filterValue];
        }

        const { sourceColumnName, targetColumnName } =
          findRelationJoinColumnsOrThrow({
            relationFieldMetadata: fieldMetadata,
            flatFieldMetadataMaps,
          });
        const joinValues = await findRelationJoinValues({
          targetFlatObjectMetadata,
          targetColumnName,
          tableAlias: RELATION_TARGET_TABLE_ALIAS,
          condition: renderRowLevelPermissionFilterToSql({
            recordFilter: filterValue as RecordGqlOperationFilter,
            tableAlias: RELATION_TARGET_TABLE_ALIAS,
            objectMetadata: targetFlatObjectMetadata,
            flatFieldMetadataMaps,
            flatObjectMetadataMaps,
          }),
          joinValues: records
            .map(
              (record) => (record as Record<string, unknown>)[sourceColumnName],
            )
            .filter(isDefined)
            .map(String),
        });

        return [sourceColumnName, { in: joinValues }];
      }),
    );

    return Object.fromEntries(entries);
  };

  return resolveFilter(recordFilter);
};
