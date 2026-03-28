import { type I18n } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';

export const resolveObjectMetadataStandardOverride = (
  objectMetadata: Pick<
    ObjectMetadataDTO,
    | 'color'
    | 'labelPlural'
    | 'labelSingular'
    | 'description'
    | 'icon'
    | 'isCustom'
    | 'standardOverrides'
  >,
  labelKey: 'color' | 'labelPlural' | 'labelSingular' | 'description' | 'icon',
  locale: keyof typeof APP_LOCALES | undefined,
  i18nInstance: I18n,
): string => {
  const safeLocale = locale ?? SOURCE_LOCALE;

  if (objectMetadata.isCustom) {
    return objectMetadata[labelKey] ?? '';
  }

  if (
    (labelKey === 'icon' || labelKey === 'color') &&
    isDefined(objectMetadata.standardOverrides?.[labelKey])
  ) {
    return objectMetadata.standardOverrides[labelKey];
  }

  // Direct standardOverrides (user customizations) take priority over
  // locale-specific translations and auto i18n translations.
  // This ensures that user-customized names (e.g., renaming "Company" to "ASTF")
  // are preserved regardless of the active UI locale. See #18950.
  if (isNonEmptyString(objectMetadata.standardOverrides?.[labelKey])) {
    return objectMetadata.standardOverrides[labelKey] ?? '';
  }

  if (
    isDefined(objectMetadata.standardOverrides?.translations) &&
    labelKey !== 'icon' &&
    labelKey !== 'color'
  ) {
    const translationValue =
      objectMetadata.standardOverrides.translations[safeLocale]?.[labelKey];

    if (isDefined(translationValue)) {
      return translationValue;
    }
  }

  const messageId = generateMessageId(objectMetadata[labelKey] ?? '');
  const translatedMessage = i18nInstance._(messageId);

  if (translatedMessage === messageId) {
    return objectMetadata[labelKey] ?? '';
  }

  return translatedMessage;
};
