import { type AllMetadataName } from '@/metadata/types/AllMetadataName';

// Read by both twenty-server and twenty-sdk extraction: a property missing on either side fails silently.
export const TRANSLATABLE_PROPERTIES_BY_METADATA_NAME = {
  objectMetadata: ['labelSingular', 'labelPlural', 'description'],
  fieldMetadata: ['label', 'description'],
  view: ['name'],
  viewFieldGroup: ['name'],
  pageLayout: ['name'],
  pageLayoutTab: ['title'],
  pageLayoutWidget: ['title'],
  commandMenuItem: ['label', 'shortLabel'],
  navigationMenuItem: ['name'],
  timelineActivityType: ['label'],
  settingsMenuItem: ['title'],
  skill: ['label', 'description'],
} as const satisfies Partial<Record<AllMetadataName, readonly string[]>>;

export type TranslatableMetadataName =
  keyof typeof TRANSLATABLE_PROPERTIES_BY_METADATA_NAME;

export type TranslatablePropertyName<T extends TranslatableMetadataName> =
  (typeof TRANSLATABLE_PROPERTIES_BY_METADATA_NAME)[T][number];
