/* @license Enterprise */

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const findLinkedRecordIdsByObjectMetadataId = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  writtenColumns,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  writtenColumns: Record<string, unknown>[];
}): Map<string, Set<string>> => {
  const { fieldIdByJoinColumnName } = buildFieldMapsFromFlatObjectMetadata(
    flatFieldMetadataMaps,
    flatObjectMetadata,
  );
  const linkedRecordIdsByObjectMetadataId = new Map<string, Set<string>>();

  for (const columns of writtenColumns) {
    for (const [columnName, value] of Object.entries(columns)) {
      const fieldMetadataId = fieldIdByJoinColumnName[columnName];

      if (!isDefined(fieldMetadataId) || !isNonEmptyString(value)) {
        continue;
      }

      const linkedObjectMetadataId = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      })?.relationTargetObjectMetadataId;

      if (!isDefined(linkedObjectMetadataId)) {
        continue;
      }

      const linkedRecordIds =
        linkedRecordIdsByObjectMetadataId.get(linkedObjectMetadataId) ??
        new Set<string>();

      linkedRecordIds.add(value.toLowerCase());
      linkedRecordIdsByObjectMetadataId.set(
        linkedObjectMetadataId,
        linkedRecordIds,
      );
    }
  }

  return linkedRecordIdsByObjectMetadataId;
};
