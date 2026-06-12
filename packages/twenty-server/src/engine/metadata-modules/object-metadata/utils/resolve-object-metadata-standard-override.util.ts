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

  // Custom object labels are user-authored: never overridden nor translated.
  // Without this gate, a label colliding with a standard catalog string
  // (e.g. "Company") would get translated against the user's intent.
  if (objectMetadata.isCustom) {
    return objectMetadata[labelKey] ?? '';
  }

  if (
    (labelKey === 'icon' || labelKey === 'color') &&
    isDefined(objectMetadata.standardOverrides?.[labelKey])
  ) {
    return objectMetadata.standardOverrides[labelKey];
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

  if (isNonEmptyString(objectMetadata.standardOverrides?.[labelKey])) {
    return objectMetadata.standardOverrides[labelKey] ?? '';
  }

  const messageId = generateMessageId(objectMetadata[labelKey] ?? '');
  const translatedMessage = i18nInstance._(messageId);

  if (translatedMessage === messageId) {
    return objectMetadata[labelKey] ?? '';
  }

  return translatedMessage;
};
