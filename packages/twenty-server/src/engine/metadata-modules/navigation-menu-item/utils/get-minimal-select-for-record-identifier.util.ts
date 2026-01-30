import { compositeTypeDefinitions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const ID_FIELD = 'id' as const;

const COMPANY_AVATAR_COLUMN = 'domainNamePrimaryLinkUrl' as const;

export const getMinimalSelectForRecordIdentifier = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): string[] => {
  const selectColumns: string[] = [ID_FIELD];

  const labelField = isDefined(
    flatObjectMetadata.labelIdentifierFieldMetadataId,
  )
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityId: flatObjectMetadata.labelIdentifierFieldMetadataId,
      })
    : undefined;

  if (isDefined(labelField)) {
    const labelCompositeType = isCompositeFieldMetadataType(labelField.type)
      ? compositeTypeDefinitions.get(labelField.type)
      : undefined;

    if (isDefined(labelCompositeType)) {
      for (const compositeProperty of labelCompositeType.properties) {
        selectColumns.push(
          computeCompositeColumnName(labelField.name, compositeProperty),
        );
      }
    } else {
      selectColumns.push(labelField.name);
    }
  }

  if (flatObjectMetadata.nameSingular === 'company') {
    selectColumns.push(COMPANY_AVATAR_COLUMN);
  } else if (isDefined(flatObjectMetadata.imageIdentifierFieldMetadataId)) {
    const imageField = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityId: flatObjectMetadata.imageIdentifierFieldMetadataId,
    });

    if (isDefined(imageField)) {
      const imageCompositeType = isCompositeFieldMetadataType(imageField.type)
        ? compositeTypeDefinitions.get(imageField.type)
        : undefined;

      if (isDefined(imageCompositeType)) {
        for (const compositeProperty of imageCompositeType.properties) {
          selectColumns.push(
            computeCompositeColumnName(imageField.name, compositeProperty),
          );
        }
      } else {
        selectColumns.push(imageField.name);
      }
    }
  }

  return selectColumns;
};
