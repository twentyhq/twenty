import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { type Route } from 'src/engine/metadata-modules/route/route.entity';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';

export type RouteEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    Route,
    ServerlessFunctionEntity | Workspace
  >;

export type FlatRoute = Omit<Route, RouteEntityRelationProperties> & {
  universalIdentifier: string;
};
