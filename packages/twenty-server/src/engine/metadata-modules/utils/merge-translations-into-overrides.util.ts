import { isNonEmptyString } from '@sniptt/guards';
import { type APP_LOCALES } from 'twenty-shared/translations';

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

// Locale and property are allowlist-validated by the callers; this re-checks
// object-safety so a hostile key can never reach the prototype chain.
const isSafeObjectKey = (key: string): boolean =>
  !['__proto__', 'constructor', 'prototype'].includes(key);

// Mirrors computeMetadataOverridesBlob for the nested translations key: an
// empty value deletes the entry, empty locale groups and an empty blob
// collapse to null so a fully-reverted entity stores no overrides at all.
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

  const { translations: existingTranslations, ...otherOverrides } =
    (existingOverrides ?? {}) as OverridesWithTranslations;

  const locales = new Set([
    ...Object.keys(existingTranslations ?? {}),
    ...safeTranslationEntries.map(({ locale }) => locale),
  ]);

  const mergedTranslations = Object.fromEntries(
    [...locales]
      .map((locale) => {
        const localeEntries = safeTranslationEntries.filter(
          (entry) => entry.locale === locale,
        );
        const removedProperties = new Set(
          localeEntries
            .filter(({ value }) => !isNonEmptyString(value))
            .map(({ property }) => property),
        );
        const addedValues = Object.fromEntries(
          localeEntries
            .filter(({ value }) => isNonEmptyString(value))
            .map(({ property, value }) => [property, value]),
        );

        return [
          locale,
          {
            ...Object.fromEntries(
              Object.entries(existingTranslations?.[locale] ?? {}).filter(
                ([property]) => !removedProperties.has(property),
              ),
            ),
            ...addedValues,
          },
        ] as const;
      })
      .filter(([, values]) => Object.keys(values).length > 0),
  );

  const overrides =
    Object.keys(mergedTranslations).length > 0
      ? { ...otherOverrides, translations: mergedTranslations }
      : otherOverrides;

  if (Object.keys(overrides).length === 0) {
    return null;
  }

  return overrides as TOverrides;
};
