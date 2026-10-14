import { getFieldOptionLabelTranslationProperty } from 'twenty-shared/i18n';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import {
  type FieldMetadataDefaultOption,
  type FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/overrides/types/effective-entity-i18n-context.type';
import { type TranslationOverrideEntry } from 'src/engine/metadata-modules/overrides/types/translation-override-entry.type';
import { resolveEffectiveFieldMetadataOptions } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-field-metadata-options.util';

type FieldMetadataOptionWithLabel = Pick<
  FieldMetadataDefaultOption,
  'id' | 'label'
>;

export const computeFieldMetadataOptionLabelUpdates = <
  TOption extends FieldMetadataOptionWithLabel,
>({
  fieldMetadataType,
  updatedOptions,
  existingOptions,
  overrides,
  i18nContext,
}: {
  fieldMetadataType: FieldMetadataType;
  updatedOptions: TOption[];
  existingOptions: FieldMetadataOptionWithLabel[] | null | undefined;
  overrides: unknown;
  i18nContext: EffectiveEntityI18nContext;
}): {
  options: TOption[];
  translationEntries: TranslationOverrideEntry[];
} => {
  const effectiveExistingOptions =
    resolveEffectiveFieldMetadataOptions({
      fieldMetadataType,
      options: existingOptions,
      overrides,
      i18nContext,
    }) ?? [];

  const labelsByOptionId = new Map(
    (existingOptions ?? []).flatMap((existingOption, index) =>
      isDefined(existingOption.id)
        ? [
            [
              existingOption.id,
              {
                sourceLabel: existingOption.label,
                effectiveLabel: effectiveExistingOptions[index]?.label,
              },
            ] as const,
          ]
        : [],
    ),
  );

  const translationEntries: TranslationOverrideEntry[] = [];

  const options = updatedOptions.map((updatedOption) => {
    const existingLabels = isDefined(updatedOption.id)
      ? labelsByOptionId.get(updatedOption.id)
      : undefined;

    if (
      !isDefined(updatedOption.id) ||
      !isDefined(existingLabels) ||
      existingLabels.effectiveLabel === existingLabels.sourceLabel
    ) {
      return updatedOption;
    }

    if (updatedOption.label !== existingLabels.effectiveLabel) {
      translationEntries.push({
        locale: i18nContext.locale ?? SOURCE_LOCALE,
        property: getFieldOptionLabelTranslationProperty(updatedOption.id),
        value: updatedOption.label,
      });
    }

    return { ...updatedOption, label: existingLabels.sourceLabel };
  });

  return { options, translationEntries };
};
