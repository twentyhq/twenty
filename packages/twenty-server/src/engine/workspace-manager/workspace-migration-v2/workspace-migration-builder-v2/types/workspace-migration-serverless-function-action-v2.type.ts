import { type FlatServerlessFunctionPropertiesToCompare } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function-properties-to-compare.type';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { type PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';

export type CreateServerlessFunctionAction = {
  type: 'create_serverless_function';
  serverlessFunction: FlatServerlessFunction;
};

export type UpdateServerlessFunctionAction = {
  type: 'update_serverless_function';
  serverlessFunctionId: string;
  code?: JSON;
  updates: Array<
    {
      [P in FlatServerlessFunctionPropertiesToCompare]: PropertyUpdate<
        FlatServerlessFunction,
        P
      >;
    }[FlatServerlessFunctionPropertiesToCompare]
  >;
};

export type DeleteServerlessFunctionAction = {
  type: 'delete_serverless_function';
  serverlessFunctionId: string;
};

export type WorkspaceMigrationServerlessFunctionActionV2 =
  | CreateServerlessFunctionAction
  | UpdateServerlessFunctionAction
  | DeleteServerlessFunctionAction;

export type WorkspaceMigrationServerlessFunctionActionTypeV2 =
  WorkspaceMigrationServerlessFunctionActionV2['type'];
