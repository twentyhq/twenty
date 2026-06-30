import { type I18n } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { translateStandardLabel } from 'src/engine/core-modules/i18n/utils/translate-standard-label.util';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';

export const resolveObjectMetadataStandardOverride = (
  objectMetadata: Pick<
    ObjectMetadataDTO,
    | 'color'
    | 'labelPlural'
    | 'labelSingular'
    | 'description'
    | 'icon'
    | 'standardOverrides'
  >,
  labelKey: 'color' | 'labelPlural' | 'labelSingular' | 'description' | 'icon',
  locale: keyof typeof APP_LOCALES | undefined,
  i18nInstance: I18n,
  isStandardApp: boolean,
  applicationCatalog?: Record<string, string>,
): string => {
  const safeLocale = locale ?? SOURCE_LOCALE;

  if (!isStandardApp && !isDefined(applicationCatalog)) {
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

  return translateStandardLabel({
    sourceValue: objectMetadata[labelKey] ?? '',
    isStandardApp,
    applicationCatalog,
    i18nInstance,
  });
};
