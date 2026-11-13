import { isFieldMetadataSelectKind } from 'twenty-shared/utils';

import { type FlatFieldMetadataOptionMaps } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option-maps.type';
import { resolveFlatFieldMetadataOptionsFromCachedMaps } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options-from-cached-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FieldMetadataOption } from 'src/modules/dashboard/chart-data/types/field-metadata-option.type';

export const getSelectOptions = ({
  fieldMetadata,
  flatFieldMetadataOptionMaps,
}: {
  fieldMetadata: FlatFieldMetadata;
  flatFieldMetadataOptionMaps: FlatFieldMetadataOptionMaps | undefined;
}): FieldMetadataOption[] | null => {
  if (!isFieldMetadataSelectKind(fieldMetadata.type)) {
    return null;
  }

  return resolveFlatFieldMetadataOptionsFromCachedMaps({
    flatFieldMetadata: fieldMetadata,
    flatFieldMetadataOptionMaps,
  });
};
