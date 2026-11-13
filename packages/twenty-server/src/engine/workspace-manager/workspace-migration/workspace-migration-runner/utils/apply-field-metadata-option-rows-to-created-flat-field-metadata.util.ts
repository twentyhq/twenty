import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { resolveFieldMetadataOptionsFromRows } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-field-metadata-options-from-rows.util';
import { type FieldMetadataOptionEnumChangeTracker } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/field-metadata-option-enum-change.type';

export const applyFieldMetadataOptionRowsToCreatedFlatFieldMetadata = ({
  flatFieldMetadata,
  fieldMetadataOptionEnumChangeTracker,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  fieldMetadataOptionEnumChangeTracker:
    | FieldMetadataOptionEnumChangeTracker
    | undefined;
}): FlatFieldMetadata => {
  const enumChange = fieldMetadataOptionEnumChangeTracker?.consume(
    flatFieldMetadata.universalIdentifier,
  );

  if (!isDefined(enumChange)) {
    return flatFieldMetadata;
  }

  return {
    ...flatFieldMetadata,
    options: resolveFieldMetadataOptionsFromRows({
      fieldMetadataEntity: flatFieldMetadata,
      fieldMetadataOptionRows: enumChange.toOptionRows,
    }),
  };
};
