import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { type RouteTrigger } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';

export type RouteTriggerEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    RouteTrigger,
    ServerlessFunctionEntity | Workspace
  >;

export type FlatRouteTrigger = Omit<
  RouteTrigger,
  RouteTriggerEntityRelationProperties
> & {
  universalIdentifier: string;
};
