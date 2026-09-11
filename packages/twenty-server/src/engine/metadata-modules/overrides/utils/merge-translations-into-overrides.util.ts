import { isNonEmptyString } from '@sniptt/guards';
import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';
import { normalizeAuthoredOverrides } from 'src/engine/metadata-modules/overrides/utils/normalize-authored-overrides.util';
import { type OverrideAuthorContext } from 'src/engine/metadata-modules/overrides/types/override-author-context.type';
import { type TranslationOverrideEntry } from 'src/engine/metadata-modules/overrides/types/translation-override-entry.type';

type EntryWithTranslations = Record<string, unknown> & {
  translations?: Record<string, Record<string, unknown>> | null;
};

// Locale and property are allowlist-validated by the callers; this re-checks
// object-safety so a hostile key can never reach the prototype chain.
const isSafeObjectKey = (key: string): boolean =>
  !['__proto__', 'constructor', 'prototype'].includes(key);

// Mirrors dispatchUpdateToAuthoredOverride for the nested translations key: an
// empty value deletes the entry, empty locale groups and an empty blob
// collapse to null so a fully-reverted entity stores no overrides at all.
// Custom entities call this too: their property edits live in base columns,
// but per-locale translations still belong in the overrides blob.
export const mergeTranslationsIntoOverrides = <
  TEntry = Record<string, unknown>,
>({
  metadataName,
  existingOverrides,
  translationEntries,
  authorUniversalIdentifier,
  authorContext,
}: {
  metadataName: AllMetadataName;
  existingOverrides: unknown;
  translationEntries: TranslationOverrideEntry[];
  authorUniversalIdentifier: string;
  authorContext: OverrideAuthorContext;
}): AuthoredOverrides<TEntry> | null => {
  const authoredOverrides =
    normalizeAuthoredOverrides<EntryWithTranslations>({
      metadataName,
      overrides: existingOverrides,
      workspaceCustomApplicationUniversalIdentifier:
        authorContext.workspaceCustomApplicationUniversalIdentifier,
    }) ?? {};

  const safeTranslationEntries = translationEntries.filter(
    ({ locale, property }) =>
      isSafeObjectKey(locale) && isSafeObjectKey(property),
  );

  if (safeTranslationEntries.length === 0) {
    return Object.keys(authoredOverrides).length > 0
      ? (authoredOverrides as AuthoredOverrides<TEntry>)
      : null;
  }

  const { translations: existingTranslations, ...otherEntryProperties } =
    authoredOverrides[authorUniversalIdentifier] ?? {};

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

  const authorEntry =
    Object.keys(mergedTranslations).length > 0
      ? { ...otherEntryProperties, translations: mergedTranslations }
      : otherEntryProperties;

  const { [authorUniversalIdentifier]: _previousEntry, ...otherEntries } =
    authoredOverrides;
  const overrides =
    Object.keys(authorEntry).length > 0
      ? { ...otherEntries, [authorUniversalIdentifier]: authorEntry }
      : otherEntries;

  if (Object.keys(overrides).length === 0) {
    return null;
  }

  return overrides as AuthoredOverrides<TEntry>;
};
