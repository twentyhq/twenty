import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { type ServerlessFunctionCode } from 'src/engine/metadata-modules/serverless-function/types/serverless-function-code.type';

export type CreateServerlessFunctionAction = {
  type: 'create_serverless_function';
  serverlessFunction: FlatServerlessFunction;
};

export type UpdateServerlessFunctionAction = {
  type: 'update_serverless_function';
  serverlessFunctionId: string;
  code?: ServerlessFunctionCode;
  updates: FlatEntityPropertiesUpdates<'serverlessFunction'>;
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
