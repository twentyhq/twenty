import { msg } from '@lingui/core/macro';
import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';

type FieldMetadataOption =
  | FieldMetadataDefaultOption
  | FieldMetadataComplexOption;

// Options the field's application ships can only be deactivated, like its fields.
const assertApplicationOptionsAreKept = ({
  existingOptions,
  normalizedOptions,
}: {
  existingOptions: FieldMetadataOption[];
  normalizedOptions: FieldMetadataOption[];
}) => {
  const normalizedOptionById = new Map(
    normalizedOptions.map((option) => [option.id, option]),
  );

  for (const existingOption of existingOptions) {
    if (existingOption.isCustom === true) {
      continue;
    }

    const normalizedOption = normalizedOptionById.get(existingOption.id);
    const optionLabel = existingOption.label;

    if (!isDefined(normalizedOption)) {
      throw new FieldMetadataException(
        `Option "${existingOption.value}" belongs to the field's application and cannot be removed`,
        FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
        {
          userFriendlyMessage: msg`Option "${optionLabel}" comes with the field and cannot be removed. Deactivate it instead.`,
        },
      );
    }

    if (normalizedOption.value !== existingOption.value) {
      throw new FieldMetadataException(
        `Option "${existingOption.value}" belongs to the field's application and its value cannot be changed`,
        FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
        {
          userFriendlyMessage: msg`The API value of option "${optionLabel}" comes with the field and cannot be changed.`,
        },
      );
    }
  }
};

export const normalizeUpdatedFieldMetadataOptions = <
  TOption extends FieldMetadataOption,
>({
  updatedOptions,
  existingOptions,
  isFieldOwnedByAnotherApplication,
}: {
  updatedOptions: TOption[];
  existingOptions: FieldMetadataOption[];
  isFieldOwnedByAnotherApplication: boolean;
}): TOption[] => {
  const existingOptionById = new Map(
    existingOptions
      .filter((option) => isDefined(option.id))
      .map((option) => [option.id, option]),
  );
  const updatedOptionIds = new Set(updatedOptions.map(({ id }) => id));
  // An input without ids, or with fresh ones, still targets the option holding the same value.
  const unclaimedExistingOptionByValue = new Map(
    existingOptions
      .filter((option) => !updatedOptionIds.has(option.id))
      .map((option) => [option.value, option]),
  );

  const normalizedOptions = updatedOptions.map((updatedOption) => {
    const {
      isActive,
      isCustom: _isCustom,
      ...optionProperties
    } = updatedOption;
    const existingOption =
      (isDefined(updatedOption.id)
        ? existingOptionById.get(updatedOption.id)
        : undefined) ?? unclaimedExistingOptionByValue.get(updatedOption.value);
    const isCustom = isDefined(existingOption)
      ? existingOption.isCustom === true
      : isFieldOwnedByAnotherApplication;

    return {
      ...optionProperties,
      id: existingOption?.id ?? updatedOption.id ?? v4(),
      ...(isActive === false ? { isActive: false } : {}),
      ...(isCustom ? { isCustom: true } : {}),
    } as TOption;
  });

  if (isFieldOwnedByAnotherApplication) {
    assertApplicationOptionsAreKept({ existingOptions, normalizedOptions });
  }

  return normalizedOptions;
};
