import { ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-translatable-properties-by-metadata-name.constant';
import { type TranslationOverrideEntry } from 'src/engine/metadata-modules/utils/translation-override-entry.type';

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
