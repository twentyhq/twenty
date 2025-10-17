import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { type DatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';

export type DatabaseEventTriggerEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    DatabaseEventTrigger,
    ServerlessFunctionEntity | Workspace
  >;

export type FlatDatabaseEventTrigger = FlatEntityFrom<
  DatabaseEventTrigger,
  DatabaseEventTriggerEntityRelationProperties
>;
