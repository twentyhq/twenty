import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const findFlatFieldMetadataByObjectUniversalIdentifierAndName = ({
  objectMetadataUniversalIdentifier,
  fieldName,
  flatFieldMetadataMaps,
}: {
  objectMetadataUniversalIdentifier: string;
  fieldName: string;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): FlatFieldMetadata | undefined =>
  Object.values(flatFieldMetadataMaps.byUniversalIdentifier).find(
    (flatFieldMetadata): flatFieldMetadata is FlatFieldMetadata =>
      isDefined(flatFieldMetadata) &&
      flatFieldMetadata.objectMetadataUniversalIdentifier ===
        objectMetadataUniversalIdentifier &&
      flatFieldMetadata.name === fieldName,
  );
