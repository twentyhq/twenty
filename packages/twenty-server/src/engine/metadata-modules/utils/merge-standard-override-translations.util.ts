import { APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

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

  for (const [locale, labelKeyValues] of Object.entries(translationsInput) as [
    keyof typeof APP_LOCALES,
    Record<string, string | null>,
  ][]) {
    if (!Object.prototype.hasOwnProperty.call(APP_LOCALES, locale)) {
      continue;
    }

    const localeOverrides: Record<string, string | null> = {
      ...(mergedTranslations[locale] ?? {}),
    };

    for (const [labelKey, value] of Object.entries(labelKeyValues)) {
      if (!allowedLabelKeys.includes(labelKey)) {
        continue;
      }

      if (!isDefined(value) || value === '') {
        delete localeOverrides[labelKey];
      } else {
        localeOverrides[labelKey] = value;
      }
    }

    if (Object.keys(localeOverrides).length === 0) {
      delete mergedTranslations[locale];
    } else {
      mergedTranslations[locale] = localeOverrides;
    }
  }

  return Object.keys(mergedTranslations).length === 0
    ? undefined
    : mergedTranslations;
};
