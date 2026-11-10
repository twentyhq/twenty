import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { isSystemUniqueFlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/utils/is-system-unique-flat-index-metadata.util';

export const findFieldUniqueBackingFlatIndexMetadata = ({
  fieldMetadataUniversalIdentifier,
  flatIndexMaps,
}: {
  fieldMetadataUniversalIdentifier: string;
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
}): FlatIndexMetadata | undefined =>
  Object.values(flatIndexMaps.byUniversalIdentifier)
    .filter(isDefined)
    .find((flatIndexMetadata) => {
      const [indexField, ...otherIndexFields] =
        flatIndexMetadata.universalFlatIndexFieldMetadatas;

      return (
        isSystemUniqueFlatIndexMetadata(flatIndexMetadata) &&
        isDefined(indexField) &&
        otherIndexFields.length === 0 &&
        !isDefined(indexField.subFieldName) &&
        indexField.fieldMetadataUniversalIdentifier ===
          fieldMetadataUniversalIdentifier
      );
    });
