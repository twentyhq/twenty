import { type ExtractPropertiesThatEndsWithId } from 'twenty-shared/types';

import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { type AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';

type PropertyNameToRelationName<T extends string> = T extends `${infer Name}Id`
  ? Name
  : never;

type ExtractEntityRelations<TEntity extends MetadataEntity<AllMetadataName>> = {
  [K in ExtractPropertiesThatEndsWithId<
    TEntity,
    'id' | 'workspaceId'
  > as PropertyNameToRelationName<K>]: K;
};

export type MetadataNameAndRelations = {
  [T in AllMetadataName]: Partial<ExtractEntityRelations<MetadataEntity<T>>>;
};

export const ALL_METADATA_NAME_MANY_TO_ONE_RELATIONS = {
  fieldMetadata: {
    objectMetadata: 'objectMetadataId',
  },
  objectMetadata: {},
  view: {
    objectMetadata: 'objectMetadataId',
  },
  viewField: {
    view: 'viewId',
    fieldMetadata: 'fieldMetadataId',
  },
  index: {
    objectMetadata: 'objectMetadataId',
  },
  serverlessFunction: {},
  cronTrigger: {
    serverlessFunction: 'serverlessFunctionId',
  },
  databaseEventTrigger: {
    serverlessFunction: 'serverlessFunctionId',
  },
  routeTrigger: {
    serverlessFunction: 'serverlessFunctionId',
  },
  viewFilter: {
    view: 'viewId',
    fieldMetadata: 'fieldMetadataId',
  },
} as const satisfies MetadataNameAndRelations;
