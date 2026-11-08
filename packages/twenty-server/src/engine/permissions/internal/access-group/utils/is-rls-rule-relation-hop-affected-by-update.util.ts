/* @license Enterprise */

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { getColumnNameToFieldMetadataIdMap } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-column-name-to-field-metadata-id.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RlsRuleRelationHop } from 'src/engine/permissions/internal/access-group/types/rls-rule-relation-hop.type';

// updatedAt is written by every update, and a hop skips soft deleted records
export const isRlsRuleRelationHopAffectedByUpdate = ({
  relationHop: { relationFieldMetadata, comparedFieldMetadataIds },
  updatedColumnNames,
  targetFlatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  relationHop: RlsRuleRelationHop;
  updatedColumnNames: string[];
  targetFlatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): boolean => {
  const fieldMetadataIdByColumnName = getColumnNameToFieldMetadataIdMap(
    targetFlatObjectMetadata,
    flatFieldMetadataMaps,
  );
  const hopFieldMetadataIds = new Set([
    ...comparedFieldMetadataIds,
    relationFieldMetadata.relationTargetFieldMetadataId,
  ]);

  return [...updatedColumnNames, 'updatedAt'].some(
    (columnName) =>
      columnName === 'deletedAt' ||
      hopFieldMetadataIds.has(fieldMetadataIdByColumnName[columnName]),
  );
};
