import { type AllMetadataName } from '@/metadata/types/all-metadata-name.type';

// The single source of truth for which provider-owned metadata properties are
// translatable. twenty-server resolves them against a catalog at request time
// and derives MetadataEntityTranslatablePropertyName from this list; twenty-sdk
// extracts them out of an application manifest at build time.
//
// The two used to keep separate lists and drifted: a property missing from one
// side is a string that is either extracted and never read, or read and never
// extracted, and both failure modes are silent.
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
} as const satisfies Partial<Record<AllMetadataName, readonly string[]>>;

export type TranslatableMetadataName =
  keyof typeof TRANSLATABLE_PROPERTIES_BY_METADATA_NAME;

export type TranslatablePropertyName<T extends TranslatableMetadataName> =
  (typeof TRANSLATABLE_PROPERTIES_BY_METADATA_NAME)[T][number];
