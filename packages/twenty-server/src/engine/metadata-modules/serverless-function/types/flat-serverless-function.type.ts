import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { type CronTrigger } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { type DatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { type Route } from 'src/engine/metadata-modules/route/route.entity';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';

export type ServerlessFunctionEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    ServerlessFunctionEntity,
    CronTrigger | DatabaseEventTrigger | Route | Workspace
  >;

export type FlatServerlessFunction = Omit<
  ServerlessFunctionEntity,
  ServerlessFunctionEntityRelationProperties
> & {
  universalIdentifier: string;
  code?: JSON;
};
