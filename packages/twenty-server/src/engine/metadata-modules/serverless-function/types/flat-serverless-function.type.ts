import { type Sources } from 'twenty-shared/types';

import { type ExtractEntityRelatedSyncableEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-syncable-entity-properties.type';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

export type ServerlessFunctionEntityRelationProperties =
  ExtractEntityRelatedSyncableEntityProperties<ServerlessFunctionEntity>;

export type FlatServerlessFunction = FlatEntityFrom<
  ServerlessFunctionEntity,
  ServerlessFunctionEntityRelationProperties
> & {
  databaseEventTriggerIds: string[];
  cronTriggerIds: string[];
  routeTriggerIds: string[];
  code?: Sources;
};
