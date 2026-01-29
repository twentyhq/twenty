import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';

import { type ObjectStandardOverridesDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-standard-overrides.dto';
import { type ObjectMetadataStandardOverridesProperties } from 'src/engine/metadata-modules/object-metadata/types/object-metadata-standard-overrides-properties.types';
import { isObjectMetadataPropertyTranslatable } from 'src/engine/metadata-modules/object-metadata/utils/is-translatable-object-metadata-property.util';

export const setStandardOverrideForLocale = ({
  overrides,
  property,
  value,
  locale,
}: {
  overrides: ObjectStandardOverridesDTO | null;
  property: ObjectMetadataStandardOverridesProperties;
  value: string;
  locale: keyof typeof APP_LOCALES;
}): ObjectStandardOverridesDTO => {
  const isSourceLocale = locale === SOURCE_LOCALE;

  if (!isObjectMetadataPropertyTranslatable(property) || isSourceLocale) {
    return {
      ...overrides,
      [property]: value,
    };
  }

  const existingTranslations = overrides?.translations ?? {};
  const existingLocaleTranslations = existingTranslations[locale] ?? {};

  return {
    ...overrides,
    translations: {
      ...existingTranslations,
      [locale]: {
        ...existingLocaleTranslations,
        [property]: value,
      },
    },
  };
};
