import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type WorkspaceMigrationActionHandlerKey } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import { type DEFERRED_WORKSPACE_MIGRATION_ACTION_HANDLER_KEY_BY_NAME } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-migration-action-handler-key-by-name.constant';

export type DeferredWorkspaceMigrationActionName =
  keyof typeof DEFERRED_WORKSPACE_MIGRATION_ACTION_HANDLER_KEY_BY_NAME;

export type DeferredWorkspaceMigrationActionNameByHandlerKey<
  TActionHandlerKey extends WorkspaceMigrationActionHandlerKey,
> = {
  [TName in DeferredWorkspaceMigrationActionName]: (typeof DEFERRED_WORKSPACE_MIGRATION_ACTION_HANDLER_KEY_BY_NAME)[TName] extends TActionHandlerKey
    ? TName
    : never;
}[DeferredWorkspaceMigrationActionName];

type DeferredWorkspaceMigrationActionPayloadByName = {
  build_index: { indexMetadataId: string };
  validate_foreignKey: { fieldMetadataId: string };
  delete_logicFunctionResources: { flatLogicFunction: FlatLogicFunction };
};

export type DeferredWorkspaceMigrationActionPayload<
  TName extends DeferredWorkspaceMigrationActionName,
> = DeferredWorkspaceMigrationActionPayloadByName[TName];

export type PersistedDeferredWorkspaceMigrationAction = {
  name: DeferredWorkspaceMigrationActionName;
  payload: DeferredWorkspaceMigrationActionPayloadByName[DeferredWorkspaceMigrationActionName];
};

export type DeferredWorkspaceMigrationAction = {
  [TName in DeferredWorkspaceMigrationActionName]: {
    name: TName;
    payload: DeferredWorkspaceMigrationActionPayloadByName[TName];
  };
}[DeferredWorkspaceMigrationActionName];
