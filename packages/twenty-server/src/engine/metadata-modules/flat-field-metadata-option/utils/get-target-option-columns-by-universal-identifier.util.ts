import { isDefined } from 'twenty-shared/utils';

import { isEnumUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatFieldMetadataOption } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata-option.type';

export type FieldMetadataOptionColumns = Pick<
  UniversalFlatFieldMetadataOption,
  'value' | 'label' | 'color' | 'position'
>;

export const getTargetOptionColumnsByUniversalIdentifier = (
  universalFlatFieldMetadata: UniversalFlatFieldMetadata | undefined,
): Map<string, FieldMetadataOptionColumns> => {
  const targetOptionColumnsByUniversalIdentifier = new Map<
    string,
    FieldMetadataOptionColumns
  >();

  if (
    !isDefined(universalFlatFieldMetadata) ||
    !isEnumUniversalFlatFieldMetadata(universalFlatFieldMetadata)
  ) {
    return targetOptionColumnsByUniversalIdentifier;
  }

  for (const option of universalFlatFieldMetadata.options ?? []) {
    if (!isDefined(option.id)) {
      continue;
    }

    targetOptionColumnsByUniversalIdentifier.set(option.id, {
      value: option.value,
      label: option.label,
      color: 'color' in option && isDefined(option.color) ? option.color : null,
      position: option.position,
    });
  }

  return targetOptionColumnsByUniversalIdentifier;
};
