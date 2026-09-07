import { isNonEmptyString } from '@sniptt/guards';

import { type TranslationOverrideEntry } from 'src/engine/metadata-modules/utils/translation-override-entry.type';

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
// Custom entities call this too: their property edits live in base columns,
// but per-locale translations still belong in the overrides blob.
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
