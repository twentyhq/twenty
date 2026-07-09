import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getCompositeFieldMetadataMap } from 'src/engine/twenty-orm/utils/format-result.util';

export const getWrittenFieldNamesFromColumns = (
  writtenColumnNames: string[],
  objectMetadataItem: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
): Set<string> => {
  const { fieldIdByJoinColumnName } = buildFieldMapsFromFlatObjectMetadata(
    flatFieldMetadataMaps,
    objectMetadataItem,
  );
  const compositeSubColumnMetadataByColumnName = getCompositeFieldMetadataMap(
    objectMetadataItem,
    flatFieldMetadataMaps,
  );

  const writtenFieldNames = new Set<string>();

  for (const writtenColumnName of writtenColumnNames) {
    const compositeSubColumnMetadata =
      compositeSubColumnMetadataByColumnName.get(writtenColumnName);

    if (isDefined(compositeSubColumnMetadata)) {
      writtenFieldNames.add(compositeSubColumnMetadata.parentField);
      continue;
    }

    const relationFieldIdForJoinColumn =
      fieldIdByJoinColumnName[writtenColumnName];

    if (isDefined(relationFieldIdForJoinColumn)) {
      const relationFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: relationFieldIdForJoinColumn,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (isDefined(relationFieldMetadata)) {
        writtenFieldNames.add(relationFieldMetadata.name);
        continue;
      }
    }

    writtenFieldNames.add(writtenColumnName);
  }

  return writtenFieldNames;
};
