import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

type FieldMetadataOption =
  | FieldMetadataDefaultOption
  | FieldMetadataComplexOption;

export const normalizeUpdatedFieldMetadataOptions = <
  TOption extends FieldMetadataOption,
>({
  updatedOptions,
  existingOptions,
}: {
  updatedOptions: TOption[];
  existingOptions: FieldMetadataOption[];
}): TOption[] => {
  const updatedOptionIds = new Set(updatedOptions.map(({ id }) => id));
  // An input without ids still targets the options holding the same values, each matched once.
  const unclaimedExistingOptionByValue = new Map(
    existingOptions
      .filter((option) => !updatedOptionIds.has(option.id))
      .map((option) => [option.value, option]),
  );

  return updatedOptions.map((updatedOption) => {
    const {
      id: updatedOptionId,
      isActive,
      applicationId: _applicationId,
      ...optionProperties
    } = updatedOption;
    const existingOption = isDefined(updatedOptionId)
      ? undefined
      : unclaimedExistingOptionByValue.get(updatedOption.value);

    unclaimedExistingOptionByValue.delete(updatedOption.value);

    return {
      // An explicit id, even null, is kept as sent so option id validation still sees it.
      id:
        updatedOptionId === undefined
          ? (existingOption?.id ?? v4())
          : updatedOptionId,
      ...optionProperties,
      ...(isActive === false ? { isActive: false } : {}),
    } as TOption;
  });
};
