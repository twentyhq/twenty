import { type Sources } from 'twenty-shared/types';

import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { type ExtractEntityRelatedSyncableEntityProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-entity-related-syncable-entity-properties.type';

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
