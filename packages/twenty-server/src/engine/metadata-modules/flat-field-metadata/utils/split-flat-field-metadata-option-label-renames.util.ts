import { isString } from '@sniptt/guards';
import {
  FIELD_OPTION_LABEL_TRANSLATABLE_PROPERTY_PATTERN,
  listTranslatablePropertyPathValues,
} from 'twenty-shared/i18n';
import { type FieldMetadataDefaultOption } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type FieldMetadataOptionWithLabel = Pick<
  FieldMetadataDefaultOption,
  'id' | 'label'
>;

type OptionLabelsByProperty = Record<string, string>;

const toOptionLabelsByProperty = (
  options: FieldMetadataOptionWithLabel[],
): OptionLabelsByProperty =>
  Object.fromEntries(
    listTranslatablePropertyPathValues({
      pattern: FIELD_OPTION_LABEL_TRANSLATABLE_PROPERTY_PATTERN,
      value: { options },
    }).flatMap(({ property, value }) =>
      isString(value) ? [[property, value]] : [],
    ),
  );

export const splitFlatFieldMetadataOptionLabelRenames = <
  TOption extends FieldMetadataOptionWithLabel,
>({
  options,
  existingOptions,
}: {
  options: TOption[];
  existingOptions: FieldMetadataOptionWithLabel[];
}): {
  options: TOption[];
  optionLabels: OptionLabelsByProperty;
  existingOptionLabels: OptionLabelsByProperty;
} => {
  const existingLabelByOptionId = new Map(
    existingOptions.flatMap(({ id, label }) =>
      isDefined(id) ? [[id, label] as const] : [],
    ),
  );
  const optionIds = new Set(options.map(({ id }) => id).filter(isDefined));
  const keptOptions = options.filter(
    ({ id }) => isDefined(id) && existingLabelByOptionId.has(id),
  );
  const removedOptions = existingOptions.filter(
    ({ id }) => isDefined(id) && !optionIds.has(id),
  );

  return {
    options: options.map((option) => {
      const existingLabel = isDefined(option.id)
        ? existingLabelByOptionId.get(option.id)
        : undefined;

      return isDefined(existingLabel)
        ? { ...option, label: existingLabel }
        : option;
    }),
    optionLabels: toOptionLabelsByProperty([...keptOptions, ...removedOptions]),
    existingOptionLabels: toOptionLabelsByProperty(existingOptions),
  };
};
