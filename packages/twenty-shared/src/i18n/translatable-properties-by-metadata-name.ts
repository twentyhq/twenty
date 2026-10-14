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
} as const satisfies Partial<Record<AllMetadataName, readonly string[]>>;

export type TranslatableMetadataName =
  keyof typeof TRANSLATABLE_PROPERTIES_BY_METADATA_NAME;

export type TranslatablePropertyName<T extends TranslatableMetadataName> =
  (typeof TRANSLATABLE_PROPERTIES_BY_METADATA_NAME)[T][number];

export const TRANSLATABLE_OPTION_LABEL_CONTEXT_BY_OWNER = {
  fieldMetadata: 'fieldMetadata.label',
  applicationVariable: 'applicationVariable.label',
  serverVariable: 'serverVariable.label',
} as const;

export type TranslatableOptionLabelOwner =
  keyof typeof TRANSLATABLE_OPTION_LABEL_CONTEXT_BY_OWNER;

export const FIELD_OPTION_LABEL_TRANSLATABLE_PROPERTY_PATTERN =
  'options.*.label';

export const NESTED_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME = {
  fieldMetadata: {
    [FIELD_OPTION_LABEL_TRANSLATABLE_PROPERTY_PATTERN]:
      TRANSLATABLE_OPTION_LABEL_CONTEXT_BY_OWNER.fieldMetadata,
  },
} as const satisfies Partial<
  Record<TranslatableMetadataName, Record<string, string>>
>;
