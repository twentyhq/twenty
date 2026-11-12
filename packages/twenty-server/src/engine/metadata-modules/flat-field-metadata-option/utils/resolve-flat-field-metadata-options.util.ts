import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option.type';
import { resolveFieldMetadataOptionsFromRows } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-field-metadata-options-from-rows.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export type FlatFieldMetadataForOptions = Pick<
  FlatFieldMetadata,
  'type' | 'options'
> &
  Partial<
    Pick<
      FlatFieldMetadata,
      'applicationId' | 'fieldMetadataOptionUniversalIdentifiers'
    >
  >;

export type FlatFieldMetadataOptionMapsForOptions = Pick<
  FlatEntityMaps<FlatFieldMetadataOption>,
  'byUniversalIdentifier'
>;

export const resolveFlatFieldMetadataOptions = ({
  flatFieldMetadata,
  flatFieldMetadataOptionMaps,
}: {
  flatFieldMetadata: FlatFieldMetadataForOptions;
  flatFieldMetadataOptionMaps:
    | FlatFieldMetadataOptionMapsForOptions
    | undefined;
}): FlatFieldMetadata['options'] => {
  if (!isDefined(flatFieldMetadataOptionMaps)) {
    return flatFieldMetadata.options;
  }

  return resolveFieldMetadataOptionsFromRows({
    fieldMetadataEntity: flatFieldMetadata,
    fieldMetadataOptionRows: (
      flatFieldMetadata.fieldMetadataOptionUniversalIdentifiers ?? []
    )
      .map(
        (universalIdentifier) =>
          flatFieldMetadataOptionMaps.byUniversalIdentifier[
            universalIdentifier
          ],
      )
      .filter(isDefined),
    shouldRowsCoverStoredOptions: true,
  });
};
