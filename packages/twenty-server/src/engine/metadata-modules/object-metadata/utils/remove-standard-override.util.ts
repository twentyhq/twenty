import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectStandardOverridesDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-standard-overrides.dto';
import { type ObjectMetadataStandardOverridesProperties } from 'src/engine/metadata-modules/object-metadata/types/object-metadata-standard-overrides-properties.types';
import { isObjectMetadataPropertyTranslatable } from 'src/engine/metadata-modules/object-metadata/utils/is-translatable-object-metadata-property.util';

export const removeStandardOverride = ({
  overrides,
  property,
  locale,
}: {
  overrides: ObjectStandardOverridesDTO | null;
  property: ObjectMetadataStandardOverridesProperties;
  locale: keyof typeof APP_LOCALES;
}): ObjectStandardOverridesDTO | null => {
  if (!isDefined(overrides)) {
    return null;
  }

  const isSourceLocale = locale === SOURCE_LOCALE;

  if (!isObjectMetadataPropertyTranslatable(property) || isSourceLocale) {
    if (!Object.prototype.hasOwnProperty.call(overrides, property)) {
      return overrides;
    }

    const { [property]: _, ...rest } = overrides as Record<string, unknown>;

    return rest as ObjectStandardOverridesDTO;
  }

  const localeTranslations = overrides.translations?.[locale];

  if (!isDefined(localeTranslations?.[property])) {
    return overrides;
  }

  const { [property]: _, ...restLocaleTranslations } = localeTranslations;

  return {
    ...overrides,
    translations: {
      ...overrides.translations,
      [locale]: restLocaleTranslations,
    },
  };
};
