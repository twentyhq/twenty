import {
  type FieldOptionLabelTranslationProperty,
  getFieldOptionLabelTranslationProperty,
} from 'twenty-shared/i18n';
import { type FieldMetadataDefaultOption } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type FieldMetadataOptionWithLabel = Pick<
  FieldMetadataDefaultOption,
  'id' | 'label'
>;

type OptionLabelsByProperty = Partial<
  Record<FieldOptionLabelTranslationProperty, string>
>;

const toOptionLabelsByProperty = (
  options: FieldMetadataOptionWithLabel[],
): OptionLabelsByProperty =>
  Object.fromEntries(
    options.flatMap(({ id, label }) =>
      isDefined(id)
        ? [[getFieldOptionLabelTranslationProperty(id), label]]
        : [],
    ),
  );

// Like a standard field label, a standard option label keeps its source column: the rename becomes an override keyed by option id
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
  // A removed option reverts to its source label, which drops its override
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
