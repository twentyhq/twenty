import { getTargetOptionColumnsByUniversalIdentifier } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/get-target-option-columns-by-universal-identifier.util';
import { isFieldMetadataOptionEntityAvailable } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/is-field-metadata-option-entity-available.util';
import { isFieldMetadataOptionSyncSkipped } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/is-field-metadata-option-sync-skipped.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatFieldMetadataOption } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata-option.type';

export const buildUniversalFlatFieldMetadataOptionsForField = ({
  universalFlatFieldMetadata,
  applicationUniversalIdentifier,
  now,
}: {
  universalFlatFieldMetadata: UniversalFlatFieldMetadata;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatFieldMetadataOption[] => {
  // TODO: drop the availability check once every instance has run the 2.56 option table command.
  if (
    !isFieldMetadataOptionEntityAvailable() ||
    isFieldMetadataOptionSyncSkipped(universalFlatFieldMetadata)
  ) {
    return [];
  }

  return [
    ...getTargetOptionColumnsByUniversalIdentifier(universalFlatFieldMetadata),
  ].map(([universalIdentifier, optionColumns]) => ({
    universalIdentifier,
    applicationUniversalIdentifier,
    fieldMetadataUniversalIdentifier:
      universalFlatFieldMetadata.universalIdentifier,
    ...optionColumns,
    overrides: null,
    createdAt: now,
    updatedAt: now,
  }));
};
