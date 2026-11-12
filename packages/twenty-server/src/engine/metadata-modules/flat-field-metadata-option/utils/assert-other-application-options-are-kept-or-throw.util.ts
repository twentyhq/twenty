import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataOptionMaps } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option-maps.type';
import { resolveEffectiveFieldMetadataOptionColumns } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-effective-field-metadata-option-columns.util';
import { isEnumUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/overrides/utils/is-caller-overriding-entity.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// Options another application ships can only be overridden or deactivated, like its fields.
export const assertOtherApplicationOptionsAreKeptOrThrow = ({
  flatFieldMetadatasToUpdate,
  existingFlatFieldMetadataOptionMaps,
  callerApplicationUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  flatFieldMetadatasToUpdate: UniversalFlatFieldMetadata[];
  existingFlatFieldMetadataOptionMaps: Pick<
    FlatFieldMetadataOptionMaps,
    'byUniversalIdentifier'
  >;
  callerApplicationUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
}): void => {
  const updatedEnumFieldByUniversalIdentifier = new Map(
    flatFieldMetadatasToUpdate
      .filter(isEnumUniversalFlatFieldMetadata)
      .map((flatFieldMetadata) => [
        flatFieldMetadata.universalIdentifier,
        flatFieldMetadata,
      ]),
  );

  for (const existingOption of Object.values(
    existingFlatFieldMetadataOptionMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(existingOption)) {
      continue;
    }

    const updatedField = updatedEnumFieldByUniversalIdentifier.get(
      existingOption.fieldMetadataUniversalIdentifier,
    );

    if (
      !isDefined(updatedField) ||
      !isCallerOverridingEntity({
        callerApplicationUniversalIdentifier,
        entityApplicationUniversalIdentifier:
          existingOption.applicationUniversalIdentifier,
        workspaceCustomApplicationUniversalIdentifier,
        isSystemSideEffect: false,
      })
    ) {
      continue;
    }

    const updatedOption = updatedField.options.find(
      (option) => option.id === existingOption.universalIdentifier,
    );
    const optionLabel =
      updatedOption?.label ??
      resolveEffectiveFieldMetadataOptionColumns({
        universalFlatFieldMetadataOption: existingOption,
        workspaceCustomApplicationUniversalIdentifier,
      }).label;

    if (!isDefined(updatedOption)) {
      throw new FieldMetadataException(
        `Option "${existingOption.value}" belongs to another application and cannot be removed`,
        FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
        {
          userFriendlyMessage: msg`Option "${optionLabel}" comes with the field and cannot be removed. Deactivate it instead.`,
        },
      );
    }

    if (updatedOption.value !== existingOption.value) {
      throw new FieldMetadataException(
        `Option "${existingOption.value}" belongs to another application and its value cannot be changed`,
        FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
        {
          userFriendlyMessage: msg`The API value of option "${optionLabel}" comes with the field and cannot be changed.`,
        },
      );
    }
  }
};
