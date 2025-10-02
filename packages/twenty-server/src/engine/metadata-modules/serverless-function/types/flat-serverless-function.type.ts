import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { type CronTrigger } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { type DatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { type Route } from 'src/engine/metadata-modules/route/route.entity';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type ServerlessFunctionLayerEntity } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.entity';
import { type ServerlessFunctionCode } from 'src/engine/metadata-modules/serverless-function/types/serverless-function-code.type';

export type ServerlessFunctionEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    ServerlessFunctionEntity,
    | CronTrigger
    | DatabaseEventTrigger
    | Route
    | Workspace
    | ApplicationEntity
    | ServerlessFunctionLayerEntity
  >;

export type FlatServerlessFunction = Omit<
  ServerlessFunctionEntity,
  ServerlessFunctionEntityRelationProperties
> & {
  universalIdentifier: string;
  code?: ServerlessFunctionCode;
};
