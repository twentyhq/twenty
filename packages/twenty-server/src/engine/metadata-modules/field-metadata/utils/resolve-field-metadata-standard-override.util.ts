import { type I18n } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { translateStandardLabel } from 'src/engine/core-modules/i18n/utils/translate-standard-label.util';
import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';

export const resolveFieldMetadataStandardOverride = (
  fieldMetadata: Pick<
    FieldMetadataDTO,
    'label' | 'description' | 'icon' | 'standardOverrides'
  >,
  labelKey: 'label' | 'description' | 'icon',
  locale: keyof typeof APP_LOCALES | undefined,
  i18nInstance: I18n,
  isStandardApp: boolean,
  applicationCatalog?: Record<string, string>,
): string => {
  const safeLocale = locale ?? SOURCE_LOCALE;

  if (!isStandardApp && !isDefined(applicationCatalog)) {
    return fieldMetadata[labelKey] ?? '';
  }

  if (labelKey === 'icon' && isDefined(fieldMetadata.standardOverrides?.icon)) {
    return fieldMetadata.standardOverrides.icon;
  }

  if (
    isDefined(fieldMetadata.standardOverrides?.translations) &&
    labelKey !== 'icon'
  ) {
    const translationValue =
      fieldMetadata.standardOverrides.translations[safeLocale]?.[labelKey];

    if (isDefined(translationValue)) {
      return translationValue;
    }
  }

  if (isNonEmptyString(fieldMetadata.standardOverrides?.[labelKey])) {
    return fieldMetadata.standardOverrides[labelKey] ?? '';
  }

  return translateStandardLabel({
    sourceValue: fieldMetadata[labelKey] ?? '',
    isStandardApp,
    applicationCatalog,
    i18nInstance,
  });
};
