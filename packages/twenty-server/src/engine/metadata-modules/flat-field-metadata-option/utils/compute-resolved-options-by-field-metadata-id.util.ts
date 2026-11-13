import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadataOptionMaps } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option-maps.type';
import { resolveFlatFieldMetadataOptions } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const computeResolvedOptionsByFieldMetadataId = ({
  flatFieldMetadataMaps,
  flatFieldMetadataOptionMaps,
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatFieldMetadataOptionMaps: FlatFieldMetadataOptionMaps;
}): ReadonlyMap<string, FieldMetadataEntity['options']> =>
  new Map(
    Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .map(
        (flatFieldMetadata) =>
          [
            flatFieldMetadata.id,
            resolveFlatFieldMetadataOptions({
              flatFieldMetadata,
              flatFieldMetadataOptionMaps,
            }),
          ] as const,
      )
      .filter(([, options]) => isDefined(options)),
  );
