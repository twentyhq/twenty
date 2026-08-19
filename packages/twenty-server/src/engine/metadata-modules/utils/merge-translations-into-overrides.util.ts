import { isNonEmptyString } from '@sniptt/guards';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-translatable-properties-by-metadata-name.constant';

export type TranslationOverrideEntry = {
  locale: keyof typeof APP_LOCALES;
  property: string;
  value?: string | null;
};

export const findInvalidTranslationOverrideProperties = (
  translationEntries: TranslationOverrideEntry[],
  metadataName: keyof typeof ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME,
): string[] => {
  const translatableProperties: readonly string[] =
    ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME[metadataName] ?? [];

  return [
    ...new Set(
      translationEntries
        .map(({ property }) => property)
        .filter((property) => !translatableProperties.includes(property)),
    ),
  ];
};

type OverridesWithTranslations = Record<string, unknown> & {
  translations?: Record<string, Record<string, unknown>> | null;
};

// Mirrors computeMetadataOverridesBlob for the nested translations key: an
// empty value deletes the entry, empty locale groups and an empty blob
// collapse to null so a fully-reverted entity stores no overrides at all.
// Locale and property are allowlist-validated by the callers; this re-checks
// object-safety so a hostile key can never reach the prototype chain.
const isSafeObjectKey = (key: string): boolean =>
  !['__proto__', 'constructor', 'prototype'].includes(key);

export const mergeTranslationsIntoOverrides = <
  TOverrides = Record<string, unknown>,
>({
  existingOverrides,
  translationEntries,
}: {
  existingOverrides: TOverrides | null;
  translationEntries: TranslationOverrideEntry[];
}): TOverrides | null => {
  const safeTranslationEntries = translationEntries.filter(
    ({ locale, property }) =>
      isSafeObjectKey(locale) && isSafeObjectKey(property),
  );

  if (safeTranslationEntries.length === 0) {
    return existingOverrides;
  }

  const overrides = {
    ...(existingOverrides ?? {}),
  } as OverridesWithTranslations;
  const translations = Object.fromEntries(
    Object.entries(overrides.translations ?? {}).map(([locale, values]) => [
      locale,
      { ...values },
    ]),
  );

  for (const { locale, property, value } of safeTranslationEntries) {
    if (isNonEmptyString(value)) {
      translations[locale] = { ...translations[locale], [property]: value };
      continue;
    }

    if (isDefined(translations[locale])) {
      delete translations[locale][property];

      if (Object.keys(translations[locale]).length === 0) {
        delete translations[locale];
      }
    }
  }

  if (Object.keys(translations).length === 0) {
    delete overrides.translations;
  } else {
    overrides.translations = translations;
  }

  if (Object.keys(overrides).length === 0) {
    return null;
  }

  return overrides as TOverrides;
};
