import { i18n } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';

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
): string => {
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
    isDefined(locale) &&
    labelKey !== 'icon'
  ) {
    const translationValue =
      objectMetadata.standardOverrides.translations[locale]?.[labelKey];

    if (isDefined(translationValue)) {
      return translationValue;
    }
  }

  if (
    locale === SOURCE_LOCALE &&
    isNonEmptyString(objectMetadata.standardOverrides?.[labelKey])
  ) {
    return objectMetadata.standardOverrides[labelKey] ?? '';
  }

  const messageId = generateMessageId(objectMetadata[labelKey] ?? '');
  const translatedMessage = i18n._(messageId);

  if (translatedMessage === messageId) {
    return objectMetadata[labelKey] ?? '';
  }

  return translatedMessage;
};
