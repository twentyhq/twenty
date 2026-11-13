import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option.type';
import { resolveFieldMetadataOptionsFromRows } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-field-metadata-options-from-rows.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export type FlatFieldMetadataForOptions = Pick<FlatFieldMetadata, 'type'> &
  Partial<Pick<FlatFieldMetadata, 'fieldMetadataOptionUniversalIdentifiers'>> &
  (
    | Pick<FlatFieldMetadata, 'options'>
    | { storedOptions: FlatFieldMetadata['options'] }
  );

const getStoredFlatFieldMetadataOptions = (
  flatFieldMetadata: FlatFieldMetadataForOptions,
): FlatFieldMetadata['options'] =>
  'storedOptions' in flatFieldMetadata
    ? flatFieldMetadata.storedOptions
    : flatFieldMetadata.options;

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
  const storedOptions = getStoredFlatFieldMetadataOptions(flatFieldMetadata);

  if (!isDefined(flatFieldMetadataOptionMaps)) {
    return storedOptions;
  }

  return resolveFieldMetadataOptionsFromRows({
    fieldMetadataEntity: {
      type: flatFieldMetadata.type,
      options: storedOptions,
    },
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
