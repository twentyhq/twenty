import { type Sources } from 'src/engine/core-modules/file-storage/types/source.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type CronTriggerEntity } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { type DatabaseEventTriggerEntity } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type RouteTriggerEntity } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { type ServerlessFunctionLayerEntity } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.entity';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';

export type ServerlessFunctionEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    ServerlessFunctionEntity,
    | CronTriggerEntity
    | DatabaseEventTriggerEntity
    | RouteTriggerEntity
    | WorkspaceEntity
    | ServerlessFunctionLayerEntity
  >;

export type FlatServerlessFunction = FlatEntityFrom<
  ServerlessFunctionEntity,
  ServerlessFunctionEntityRelationProperties
> & {
  databaseEventTriggerIds: string[];
  cronTriggerIds: string[];
  routeTriggerIds: string[];
  code?: Sources;
};
