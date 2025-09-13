import { type I18n } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';

export const resolveObjectMetadataStandardOverride = (
  objectMetadata: Pick<
    ObjectMetadataDTO,
    | 'labelPlural'
    | 'labelSingular'
    | 'description'
    | 'icon'
    | 'isCustom'
    | 'standardOverrides'
  >,
  labelKey: 'labelPlural' | 'labelSingular' | 'description' | 'icon',
  locale: keyof typeof APP_LOCALES | undefined,
  i18nInstance: I18n,
): string => {
  const safeLocale = locale ?? SOURCE_LOCALE;

  if (objectMetadata.isCustom) {
    return objectMetadata[labelKey] ?? '';
  }

  if (
    labelKey === 'icon' &&
    isDefined(objectMetadata.standardOverrides?.icon)
  ) {
    return objectMetadata.standardOverrides.icon;
  }

  if (
    isDefined(objectMetadata.standardOverrides?.translations) &&
    labelKey !== 'icon'
  ) {
    const translationValue =
      objectMetadata.standardOverrides.translations[safeLocale]?.[labelKey];

    if (isDefined(translationValue)) {
      return translationValue;
    }
  }

  if (
    safeLocale === SOURCE_LOCALE &&
    isNonEmptyString(objectMetadata.standardOverrides?.[labelKey])
  ) {
    return objectMetadata.standardOverrides[labelKey] ?? '';
  }

  const messageId = generateMessageId(objectMetadata[labelKey] ?? '');
  const translatedMessage = i18nInstance._(messageId);

  if (translatedMessage === messageId) {
    return objectMetadata[labelKey] ?? '';
  }

  return translatedMessage;
};
