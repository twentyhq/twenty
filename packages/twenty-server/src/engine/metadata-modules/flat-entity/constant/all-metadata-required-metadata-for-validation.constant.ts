import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataManyToOneRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-related-metadata-names.type';

type MetadataRequiredForValidation = {
  [T in AllMetadataName]: Record<
    MetadataManyToOneRelatedMetadataNames<T>,
    true
  > & {
    [K in Exclude<AllMetadataName, T>]?: true;
  };
};

export const ALL_METADATA_REQUIRED_METADATA_FOR_VALIDATION = {
  fieldMetadata: {
    objectMetadata: true,
  },
  objectMetadata: {
    fieldMetadata: true,
  },
  view: {
    fieldMetadata: true,
    objectMetadata: true,
  },
  viewField: {
    view: true,
    fieldMetadata: true,
    objectMetadata: true,
  },
  index: {
    objectMetadata: true,
    fieldMetadata: true,
  },
  serverlessFunction: {},
  cronTrigger: {
    serverlessFunction: true,
  },
  databaseEventTrigger: {
    serverlessFunction: true,
  },
  routeTrigger: {
    serverlessFunction: true,
  },
  viewFilter: {
    view: true,
    fieldMetadata: true,
  },
  viewGroup: {
    fieldMetadata: true,
    view: true,
  },
  role: {},
  roleTarget: {
    role: true,
    agent: true,
  },
  agent: {
    role: true,
  },
  pageLayout: {},
  pageLayoutTab: {
    pageLayout: true,
  },
  pageLayoutWidget: {
    pageLayoutTab: true,
  },
} as const satisfies MetadataRequiredForValidation;
