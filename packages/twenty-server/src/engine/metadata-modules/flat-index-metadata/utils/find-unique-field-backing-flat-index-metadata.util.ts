import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { isSystemUniqueFlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/utils/is-system-unique-flat-index-metadata.util';

export const findUniqueFieldBackingFlatIndexMetadata = ({
  fieldMetadataUniversalIdentifier,
  flatIndexMaps,
}: {
  fieldMetadataUniversalIdentifier: string;
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
}): FlatIndexMetadata | undefined =>
  Object.values(flatIndexMaps.byUniversalIdentifier)
    .filter(isDefined)
    .find((flatIndexMetadata) => {
      const indexFields = flatIndexMetadata.universalFlatIndexFieldMetadatas;

      return (
        isSystemUniqueFlatIndexMetadata(flatIndexMetadata) &&
        indexFields.length === 1 &&
        !isDefined(indexFields[0].subFieldName) &&
        indexFields[0].fieldMetadataUniversalIdentifier ===
          fieldMetadataUniversalIdentifier
      );
    });
