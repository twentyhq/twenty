import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataManyToOneRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-related-metadata-names.type';

type MetadataRequiredForValidation = {
  [T in AllMetadataName]: Record<
    Exclude<MetadataManyToOneRelatedMetadataNames<T>, T>,
    true
  > & {
    [K in Exclude<AllMetadataName, T>]?: true;
  };
};

// TODO deprecate in favor of ALL_METADATA_SERIALIZED_RELATION
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
    viewFieldGroup: true,
  },
  viewFieldGroup: {
    view: true,
  },
  index: {
    objectMetadata: true,
    fieldMetadata: true,
  },
  logicFunction: {},
  viewFilter: {
    view: true,
    fieldMetadata: true,
    viewFilterGroup: true,
  },
  viewGroup: {
    fieldMetadata: true,
    view: true,
  },
  viewFilterGroup: {
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
  skill: {},
  commandMenuItem: {
    objectMetadata: true,
    frontComponent: true,
  },
  navigationMenuItem: {
    objectMetadata: true,
    view: true,
  },
  pageLayout: {
    objectMetadata: true,
    pageLayoutTab: true,
  },
  pageLayoutTab: {
    pageLayout: true,
  },
  pageLayoutWidget: {
    objectMetadata: true,
    pageLayoutTab: true,
  },
  rowLevelPermissionPredicate: {
    fieldMetadata: true,
    objectMetadata: true,
    role: true,
    rowLevelPermissionPredicateGroup: true,
  },
  rowLevelPermissionPredicateGroup: {
    role: true,
    objectMetadata: true,
  },
  frontComponent: {},
  webhook: {},
} as const satisfies MetadataRequiredForValidation;
