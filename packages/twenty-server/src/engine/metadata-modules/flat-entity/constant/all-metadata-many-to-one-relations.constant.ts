import { MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type';
import { AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { ExtractPropertiesThatEndsWithId } from 'twenty-shared/types';

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

export const ALL_METADATA_NAME_AND_RELATIONS = {
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
