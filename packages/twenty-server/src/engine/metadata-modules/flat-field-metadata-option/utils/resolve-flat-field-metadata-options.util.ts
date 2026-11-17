import { isDefined } from 'twenty-shared/utils';

import { resolveFieldMetadataOptionsFromRows } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-field-metadata-options-from-rows.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadataOption } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata-option.type';

export type FlatFieldMetadataForOptions = Pick<FlatFieldMetadata, 'type'> &
  Partial<
    Pick<
      FlatFieldMetadata,
      'applicationId' | 'fieldMetadataOptionUniversalIdentifiers' | 'options'
    >
  >;

export type FlatFieldMetadataOptionMapsForOptions = Pick<
  UniversalFlatEntityMaps<UniversalFlatFieldMetadataOption>,
  'byUniversalIdentifier'
>;

export const resolveFlatFieldMetadataOptions = ({
  flatFieldMetadata,
  flatFieldMetadataOptionMaps,
  shouldApplyOverrides,
}: {
  flatFieldMetadata: FlatFieldMetadataForOptions;
  flatFieldMetadataOptionMaps: FlatFieldMetadataOptionMapsForOptions;
  shouldApplyOverrides?: boolean;
}): FlatFieldMetadata['options'] => {
  return resolveFieldMetadataOptionsFromRows({
    fieldMetadataEntity: {
      type: flatFieldMetadata.type,
      applicationId: flatFieldMetadata.applicationId,
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
    shouldApplyOverrides,
  });
};
