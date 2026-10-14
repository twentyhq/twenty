import { isNonEmptyString } from '@sniptt/guards';
import { getFieldOptionLabelTranslationProperty } from 'twenty-shared/i18n';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import {
  type FieldMetadataDefaultOption,
  type FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/overrides/types/effective-entity-i18n-context.type';
import { type TranslationOverrideEntry } from 'src/engine/metadata-modules/overrides/types/translation-override-entry.type';
import { readOverrideTranslation } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-entity-property.util';
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

  const locale = i18nContext.locale ?? SOURCE_LOCALE;

  const labelsByOptionId = new Map(
    (existingOptions ?? []).flatMap((existingOption, index) => {
      if (!isDefined(existingOption.id)) {
        return [];
      }

      const effectiveLabel = effectiveExistingOptions[index]?.label;
      const workspaceTranslation = readOverrideTranslation({
        metadataName: 'fieldMetadata',
        overrides,
        locale,
        property: getFieldOptionLabelTranslationProperty(existingOption.id),
        authorContext: i18nContext,
      });

      return [
        [
          existingOption.id,
          {
            sourceLabel: existingOption.label,
            effectiveLabel,
            isShownTranslated:
              isDefined(workspaceTranslation) ||
              effectiveLabel !== existingOption.label,
          },
        ] as const,
      ];
    }),
  );

  const translationEntries: TranslationOverrideEntry[] = [];

  const options = updatedOptions.map((updatedOption) => {
    const existingLabels = isDefined(updatedOption.id)
      ? labelsByOptionId.get(updatedOption.id)
      : undefined;

    if (
      !isDefined(updatedOption.id) ||
      !isDefined(existingLabels) ||
      !existingLabels.isShownTranslated ||
      !isNonEmptyString(updatedOption.label) ||
      updatedOption.label.trim() === ''
    ) {
      return updatedOption;
    }

    if (updatedOption.label !== existingLabels.effectiveLabel) {
      translationEntries.push({
        locale,
        property: getFieldOptionLabelTranslationProperty(updatedOption.id),
        value: updatedOption.label,
      });
    }

    return { ...updatedOption, label: existingLabels.sourceLabel };
  });

  return { options, translationEntries };
};
