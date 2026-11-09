/* @license Enterprise */

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { getColumnNameToFieldMetadataIdMap } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-column-name-to-field-metadata-id.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const isRlsRuleRelationAffectedByUpdate = ({
  relationFieldMetadata,
  comparedFieldMetadataIds,
  updatedColumnNames,
  targetFlatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  relationFieldMetadata: OrmFlatFieldMetadata;
  comparedFieldMetadataIds: string[];
  updatedColumnNames: string[];
  targetFlatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): boolean => {
  const fieldMetadataIdByColumnName = getColumnNameToFieldMetadataIdMap(
    targetFlatObjectMetadata,
    flatFieldMetadataMaps,
  );
  const relationFieldMetadataIds = new Set([
    ...comparedFieldMetadataIds,
    relationFieldMetadata.relationTargetFieldMetadataId,
  ]);

  return [...updatedColumnNames, 'updatedAt'].some(
    (columnName) =>
      columnName === 'deletedAt' ||
      relationFieldMetadataIds.has(fieldMetadataIdByColumnName[columnName]),
  );
};
