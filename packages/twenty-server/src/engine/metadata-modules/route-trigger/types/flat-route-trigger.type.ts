import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type RouteTriggerEntity } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';

export type RouteTriggerEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    RouteTriggerEntity,
    ServerlessFunctionEntity | WorkspaceEntity
  >;

export type FlatRouteTrigger = FlatEntityFrom<
  RouteTriggerEntity,
  RouteTriggerEntityRelationProperties
>;
