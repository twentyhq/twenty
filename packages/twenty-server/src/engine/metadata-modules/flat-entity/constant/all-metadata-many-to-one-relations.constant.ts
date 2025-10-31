import { type AllMetadataName } from 'twenty-shared/metadata';
import { type ExtractPropertiesThatEndsWithId } from 'twenty-shared/types';

import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';

type ExtractEntityRelations<TEntity extends MetadataEntity<AllMetadataName>> = {
  [K in ExtractPropertiesThatEndsWithId<TEntity, 'id' | 'workspaceId'>]: K;
};

type MetadataRelatedMetadataNames<T extends AllMetadataName> =
  keyof ExtractEntityRelations<MetadataEntity<T>>;

type MetadataNameAndRelations = {
  [T in AllMetadataName]: MetadataRelatedMetadataNames<T> extends never
    ? Record<string, never>
    : {
        [P in MetadataRelatedMetadataNames<T>]?: AllMetadataName;
      };
};

export const ALL_METADATA_RELATED_METADATA_BY_FOREIGN_KEY = {
  fieldMetadata: {
    objectMetadataId: 'objectMetadata',
  },
  objectMetadata: {},
  view: {
    kanbanAggregateOperationFieldMetadataId: 'fieldMetadata',
    calendarFieldMetadataId: 'fieldMetadata',
    objectMetadataId: 'objectMetadata',
  },
  viewField: {
    viewId: 'view',
    fieldMetadataId: 'fieldMetadata',
  },
  viewGroup: {
    viewId: 'view',
    fieldMetadataId: 'fieldMetadata',
  },
  index: {
    objectMetadataId: 'objectMetadata',
  },
  serverlessFunction: {},
  cronTrigger: {
    serverlessFunctionId: 'serverlessFunction',
  },
  databaseEventTrigger: {
    serverlessFunctionId: 'serverlessFunction',
  },
  routeTrigger: {
    serverlessFunctionId: 'serverlessFunction',
  },
  viewFilter: {
    viewId: 'view',
    fieldMetadataId: 'fieldMetadata',
  },
} as const satisfies MetadataNameAndRelations;
