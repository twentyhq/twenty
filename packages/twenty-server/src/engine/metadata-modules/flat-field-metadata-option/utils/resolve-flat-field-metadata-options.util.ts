import { isDefined } from 'twenty-shared/utils';

import { resolveFieldMetadataOptionsFromRows } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-field-metadata-options-from-rows.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadataOption } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata-option.type';

export type FlatFieldMetadataForOptions = Pick<FlatFieldMetadata, 'type'> &
  Partial<
    Pick<
      FlatFieldMetadata,
      'fieldMetadataOptionUniversalIdentifiers' | 'options'
    >
  >;

export type FlatFieldMetadataOptionMapsForOptions =
  UniversalFlatEntityMaps<UniversalFlatFieldMetadataOption>;

export const resolveFlatFieldMetadataOptions = ({
  flatFieldMetadata,
  flatFieldMetadataOptionMaps,
}: {
  flatFieldMetadata: FlatFieldMetadataForOptions;
  flatFieldMetadataOptionMaps: FlatFieldMetadataOptionMapsForOptions;
}): FlatFieldMetadata['options'] => {
  return resolveFieldMetadataOptionsFromRows({
    fieldMetadataEntity: {
      type: flatFieldMetadata.type,
      options: flatFieldMetadata.options,
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
  });
};
