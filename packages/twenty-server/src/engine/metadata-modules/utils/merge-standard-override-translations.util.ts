import { APP_LOCALES } from 'twenty-shared/translations';

export type StandardOverrideTranslations = Partial<
  Record<keyof typeof APP_LOCALES, Record<string, string | null>>
>;

export const mergeStandardOverrideTranslations = ({
  existingTranslations,
  translationsInput,
  allowedLabelKeys,
}: {
  existingTranslations: StandardOverrideTranslations | undefined;
  translationsInput: StandardOverrideTranslations;
  allowedLabelKeys: readonly string[];
}): StandardOverrideTranslations | undefined => {
  const mergedTranslations: StandardOverrideTranslations = {
    ...(existingTranslations ?? {}),
  };

  // translationsInput originates from an untyped JSON GraphQL scalar, so each
  // entry is validated at runtime before being merged.
  for (const [locale, labelKeyValues] of Object.entries(translationsInput)) {
    if (!Object.prototype.hasOwnProperty.call(APP_LOCALES, locale)) {
      continue;
    }

    // Guard against malformed shapes (e.g. a null or non-object value for a
    // locale) so we never throw on Object.entries below.
    if (typeof labelKeyValues !== 'object' || labelKeyValues === null) {
      continue;
    }

    const typedLocale = locale as keyof typeof APP_LOCALES;

    const localeOverrides: Record<string, string | null> = {
      ...(mergedTranslations[typedLocale] ?? {}),
    };

    for (const [labelKey, value] of Object.entries(labelKeyValues)) {
      if (!allowedLabelKeys.includes(labelKey)) {
        continue;
      }

      // Only persist non-empty string values; null, non-string or blank values
      // clear the override for that key.
      if (typeof value !== 'string' || value.trim() === '') {
        delete localeOverrides[labelKey];
      } else {
        localeOverrides[labelKey] = value;
      }
    }

    if (Object.keys(localeOverrides).length === 0) {
      delete mergedTranslations[typedLocale];
    } else {
      mergedTranslations[typedLocale] = localeOverrides;
    }
  }

  return Object.keys(mergedTranslations).length === 0
    ? undefined
    : mergedTranslations;
};
