import { msg, t } from '@lingui/core/macro';
import { type EnumFieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { isEnumUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatFieldMetadataOption } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata-option.type';

// Option ids are their rows' universal identifiers, so they must be unique across the workspace.
// Existing rows count too: a field replaced in the same migration still owns its rows until it is deleted.
export const validateOptionIdsNotUsedByOtherFields = ({
  universalFlatFieldMetadata,
  flatFieldMetadataMaps,
  flatFieldMetadataOptionMaps,
}: {
  universalFlatFieldMetadata: UniversalFlatFieldMetadata<EnumFieldMetadataType>;
  flatFieldMetadataMaps: UniversalFlatEntityMaps<UniversalFlatFieldMetadata>;
  flatFieldMetadataOptionMaps: UniversalFlatEntityMaps<UniversalFlatFieldMetadataOption>;
}): FlatFieldMetadataValidationError[] => {
  const optionIds = new Set(
    (universalFlatFieldMetadata.options ?? [])
      .map((option) => option.id)
      .filter(isDefined),
  );

  if (optionIds.size === 0) {
    return [];
  }

  const optionIdsUsedByOtherFields = new Set<string>();

  for (const optionId of optionIds) {
    const existingOption =
      flatFieldMetadataOptionMaps.byUniversalIdentifier[optionId];

    if (
      isDefined(existingOption) &&
      existingOption.fieldMetadataUniversalIdentifier !==
        universalFlatFieldMetadata.universalIdentifier
    ) {
      optionIdsUsedByOtherFields.add(optionId);
    }
  }

  for (const otherFlatFieldMetadata of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  )) {
    if (
      !isDefined(otherFlatFieldMetadata) ||
      otherFlatFieldMetadata.universalIdentifier ===
        universalFlatFieldMetadata.universalIdentifier ||
      !isEnumUniversalFlatFieldMetadata(otherFlatFieldMetadata)
    ) {
      continue;
    }

    for (const option of otherFlatFieldMetadata.options ?? []) {
      if (isDefined(option.id) && optionIds.has(option.id)) {
        optionIdsUsedByOtherFields.add(option.id);
      }
    }
  }

  return [...optionIdsUsedByOtherFields].map((optionId) => ({
    code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    message: t`Option id "${optionId}" is already used by another field`,
    userFriendlyMessage: msg`Option id "${optionId}" is already used by another field`,
    value: optionId,
  }));
};
