import { type AllMetadataName } from 'twenty-shared/metadata';

export const ALL_METADATA_SIDE_EFFECT_COMPANION_METADATA_NAMES = {
  workflow: ['workflowVersion', 'commandMenuItem', 'logicFunction'],
  workflowVersion: ['workflow', 'commandMenuItem', 'logicFunction'],
  fieldMetadata: [
    'index',
    'searchFieldMetadata',
    'validationRule',
    'view',
    'viewField',
    'viewFieldGroup',
    'pageLayoutTab',
    'pageLayoutWidget',
  ],
  objectMetadata: [
    'fieldMetadata',
    'index',
    'searchFieldMetadata',
    'validationRule',
    'view',
    'viewField',
    'viewFieldGroup',
    'pageLayout',
    'pageLayoutTab',
    'pageLayoutWidget',
    'commandMenuItem',
  ],
} as const satisfies Partial<
  Record<AllMetadataName, readonly AllMetadataName[]>
>;
