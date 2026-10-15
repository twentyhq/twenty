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

export const FIELD_OPTION_LABEL_TRANSLATABLE_PROPERTY_PATTERN =
  'options.*.label';

export const MANIFEST_TRANSLATABLE_PROPERTIES = {
  fieldMetadata: {
    [FIELD_OPTION_LABEL_TRANSLATABLE_PROPERTY_PATTERN]: 'fieldMetadata.label',
  },
  application: {
    displayName: 'application.displayName',
    description: 'application.description',
    'billing.description': 'application.billing.description',
    'billing.recurring.*.label': 'application.billing.recurring.label',
    'billing.operations.*.label': 'application.billing.operations.label',
  },
  applicationVariable: {
    label: 'applicationVariable.label',
    description: 'applicationVariable.description',
    'options.*.label': 'applicationVariable.label',
  },
  serverVariable: {
    description: 'serverVariable.description',
    'options.*.label': 'serverVariable.label',
  },
  role: {
    label: 'role.label',
    description: 'role.description',
  },
  skill: {
    label: 'skill.label',
    description: 'skill.description',
  },
  agent: {
    label: 'agent.label',
    description: 'agent.description',
  },
  logicFunction: {
    name: 'logicFunction.name',
    description: 'logicFunction.description',
  },
  frontComponent: {
    name: 'frontComponent.name',
    description: 'frontComponent.description',
  },
  permissionFlag: {
    label: 'permissionFlag.label',
    description: 'permissionFlag.description',
  },
  connectionProvider: {
    displayName: 'connectionProvider.displayName',
  },
} as const satisfies Record<string, Record<string, string>>;

export type ManifestTranslatableEntity =
  keyof typeof MANIFEST_TRANSLATABLE_PROPERTIES;

export type ManifestTranslatableProperty<
  TEntity extends ManifestTranslatableEntity,
> = keyof (typeof MANIFEST_TRANSLATABLE_PROPERTIES)[TEntity] & string;

export const NESTED_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME = {
  fieldMetadata: MANIFEST_TRANSLATABLE_PROPERTIES.fieldMetadata,
} as const satisfies Partial<
  Record<TranslatableMetadataName, Record<string, string>>
>;
