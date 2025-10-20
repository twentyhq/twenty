import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { type CronTrigger } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';

export type CronTriggerEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    CronTrigger,
    ServerlessFunctionEntity | Workspace
  >;

export type FlatCronTrigger = FlatEntityFrom<
  CronTrigger,
  CronTriggerEntityRelationProperties
>;
