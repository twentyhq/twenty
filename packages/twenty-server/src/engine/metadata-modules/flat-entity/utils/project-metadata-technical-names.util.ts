import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataTechnicalNamesByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/types/metadata-technical-names-by-universal-identifier.type';

type MetadataNamingMaps = Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
>;

export const projectMetadataTechnicalNames = ({
  metadata,
  technicalNamesByUniversalIdentifier,
}: {
  metadata: MetadataNamingMaps;
  technicalNamesByUniversalIdentifier: MetadataTechnicalNamesByUniversalIdentifier;
}): MetadataNamingMaps => ({
  flatObjectMetadataMaps: {
    ...metadata.flatObjectMetadataMaps,
    byUniversalIdentifier: Object.fromEntries(
      Object.entries(metadata.flatObjectMetadataMaps.byUniversalIdentifier).map(
        ([universalIdentifier, objectMetadata]) => [
          universalIdentifier,
          isDefined(objectMetadata)
            ? {
                ...objectMetadata,
                nameSingular:
                  technicalNamesByUniversalIdentifier.objects[
                    universalIdentifier
                  ]?.nameSingular ?? objectMetadata.nameSingular,
                namePlural:
                  technicalNamesByUniversalIdentifier.objects[
                    universalIdentifier
                  ]?.namePlural ?? objectMetadata.namePlural,
              }
            : objectMetadata,
        ],
      ),
    ),
  },
  flatFieldMetadataMaps: {
    ...metadata.flatFieldMetadataMaps,
    byUniversalIdentifier: Object.fromEntries(
      Object.entries(metadata.flatFieldMetadataMaps.byUniversalIdentifier).map(
        ([universalIdentifier, fieldMetadata]) => [
          universalIdentifier,
          isDefined(fieldMetadata)
            ? {
                ...fieldMetadata,
                name:
                  technicalNamesByUniversalIdentifier.fields[
                    universalIdentifier
                  ] ?? fieldMetadata.name,
              }
            : fieldMetadata,
        ],
      ),
    ),
  },
});
