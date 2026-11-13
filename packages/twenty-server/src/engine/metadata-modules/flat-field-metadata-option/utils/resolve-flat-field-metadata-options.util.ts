import { isDefined } from 'twenty-shared/utils';

import { resolveFieldMetadataOptionsFromRows } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-field-metadata-options-from-rows.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadataOption } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata-option.type';

// TODO: keep only the option rows once 2.59 has run on every workspace, together with the options column drop.
export type FlatFieldMetadataForOptions = Pick<FlatFieldMetadata, 'type'> &
  Partial<
    Pick<
      FlatFieldMetadata,
      'applicationId' | 'fieldMetadataOptionUniversalIdentifiers'
    >
  > &
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

export type FlatFieldMetadataOptionMapsForOptions =
  UniversalFlatEntityMaps<UniversalFlatFieldMetadataOption>;

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
      options: getStoredFlatFieldMetadataOptions(flatFieldMetadata),
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
    // TODO: remove the stored options fallback once 2.59 has run on every workspace, together with the options column drop.
    shouldRowsCoverStoredOptions: true,
    shouldApplyOverrides,
  });
};
