import { type AllMetadataName } from 'twenty-shared/metadata';
import { type ExtractPropertiesThatEndsWithId } from 'twenty-shared/types';

import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';

type ExtractEntityRelations<TEntity extends MetadataEntity<AllMetadataName>> = {
  [K in ExtractPropertiesThatEndsWithId<TEntity, 'id' | 'workspaceId'>]: K;
};

type MetadataRelatedMetadataNames<T extends AllMetadataName> =
  keyof ExtractEntityRelations<MetadataEntity<T>>;

type MetadataNameAndRelations = {
  [TSourceMetadataName in AllMetadataName]: MetadataRelatedMetadataNames<TSourceMetadataName> extends never
    ? Record<string, never>
    : {
        [K in MetadataRelatedMetadataNames<TSourceMetadataName>]?: {
          [TTargetMetadataName in AllMetadataName]?: {
            metadataName: TTargetMetadataName;
            flatEntityForeignKeyAggregator: keyof MetadataFlatEntity<TTargetMetadataName>;
          };
        }[AllMetadataName];
      };
};

export const ALL_METADATA_RELATED_METADATA_BY_FOREIGN_KEY = {
  fieldMetadata: {
    objectMetadataId: {
      metadataName: 'objectMetadata',
      flatEntityForeignKeyAggregator: 'fieldMetadataIds',
    },
  },
  objectMetadata: {},
  view: {
    kanbanAggregateOperationFieldMetadataId: {
      metadataName: 'fieldMetadata',
      flatEntityForeignKeyAggregator: 'kanbanAggregateOperationViewIds',
    },
    calendarFieldMetadataId: {
      metadataName: 'fieldMetadata',
      flatEntityForeignKeyAggregator: 'calendarViewIds',
    },
    objectMetadataId: {
      metadataName: 'objectMetadata',
      flatEntityForeignKeyAggregator: 'viewIds',
    },
  },
  viewField: {
    viewId: {
      metadataName: 'view',
      flatEntityForeignKeyAggregator: 'viewFieldIds',
    },
    fieldMetadataId: {
      metadataName: 'fieldMetadata',
      flatEntityForeignKeyAggregator: 'viewFieldIds',
    },
  },
  viewGroup: {
    viewId: {
      metadataName: 'view',
      flatEntityForeignKeyAggregator: 'viewGroupIds',
    },
    fieldMetadataId: {
      metadataName: 'fieldMetadata',
      flatEntityForeignKeyAggregator: 'viewGroupIds',
    },
  },
  index: {
    objectMetadataId: {
      metadataName: 'objectMetadata',
      flatEntityForeignKeyAggregator: 'indexMetadataIds',
    },
  },
  serverlessFunction: {},
  cronTrigger: {
    serverlessFunctionId: {
      metadataName: 'serverlessFunction',
      flatEntityForeignKeyAggregator: 'cronTriggerIds',
    },
  },
  databaseEventTrigger: {
    serverlessFunctionId: {
      metadataName: 'serverlessFunction',
      flatEntityForeignKeyAggregator: 'databaseEventTriggerIds',
    },
  },
  routeTrigger: {
    serverlessFunctionId: {
      metadataName: 'serverlessFunction',
      flatEntityForeignKeyAggregator: 'routeTriggerIds',
    },
  },
  viewFilter: {
    viewId: {
      metadataName: 'view',
      flatEntityForeignKeyAggregator: 'viewFilterIds',
    },
    fieldMetadataId: {
      metadataName: 'fieldMetadata',
      flatEntityForeignKeyAggregator: 'viewFilterIds',
    },
  },
} as const satisfies MetadataNameAndRelations;
