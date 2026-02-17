import { type AllMetadataName } from 'twenty-shared/metadata';
import { type Expect } from 'twenty-shared/testing';

import { type AllJsonbPropertiesWithSerializedPropertiesForMetadataName } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-jsonb-properties-with-serialized-relation-by-metadata-name.constant';

type MetadataSerializedRelationProperties = {
  [TSourceMetadataName in AllMetadataName]: [
    AllJsonbPropertiesWithSerializedPropertiesForMetadataName<TSourceMetadataName>,
  ] extends [never]
    ? // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      {}
    : Partial<Record<AllMetadataName, true>>;
};

export const ALL_METADATA_SERIALIZED_RELATION = {
  agent: {},
  skill: {},
  commandMenuItem: {},
  navigationMenuItem: {},
  fieldMetadata: {
    fieldMetadata: true,
  },
  objectMetadata: {},
  view: {},
  viewField: {},
  viewFieldGroup: {},
  viewFilter: {},
  viewGroup: {},
  index: {},
  logicFunction: {},
  role: {},
  roleTarget: {},
  pageLayout: {},
  pageLayoutTab: {},
  pageLayoutWidget: {
    fieldMetadata: true,
  },
  rowLevelPermissionPredicate: {},
  rowLevelPermissionPredicateGroup: {},
  viewFilterGroup: {},
  frontComponent: {},
  webhook: {},
} as const satisfies MetadataSerializedRelationProperties;

// satisfies with complex mapped types involving nested generics doesn't always catch missing required keys
// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<
    AllMetadataName extends keyof typeof ALL_METADATA_SERIALIZED_RELATION
      ? true
      : false
  >,
];
