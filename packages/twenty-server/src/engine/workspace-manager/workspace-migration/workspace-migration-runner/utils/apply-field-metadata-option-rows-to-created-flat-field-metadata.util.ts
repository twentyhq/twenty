import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { resolveFieldMetadataOptionsFromRows } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-field-metadata-options-from-rows.util';
import { type FieldMetadataOptionEnumChangeOfMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/field-metadata-option-enum-change.type';

export const applyFieldMetadataOptionRowsToCreatedFlatFieldMetadata = ({
  flatFieldMetadata,
  fieldMetadataOptionEnumChanges,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  fieldMetadataOptionEnumChanges:
    | ReadonlyMap<string, FieldMetadataOptionEnumChangeOfMigration>
    | undefined;
}): FlatFieldMetadata => {
  const enumChange = fieldMetadataOptionEnumChanges?.get(
    flatFieldMetadata.universalIdentifier,
  );

  return isDefined(enumChange)
    ? {
        ...flatFieldMetadata,
        options: resolveFieldMetadataOptionsFromRows({
          fieldMetadataEntity: flatFieldMetadata,
          fieldMetadataOptionRows: enumChange.toOptionRows,
        }),
      }
    : flatFieldMetadata;
};
