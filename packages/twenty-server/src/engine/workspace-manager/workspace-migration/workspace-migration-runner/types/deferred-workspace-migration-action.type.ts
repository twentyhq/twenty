import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type WorkspaceMigrationActionHandlerKey } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import { type DEFERRABLE_WORKSPACE_MIGRATION_ACTIONS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferrable-workspace-migration-actions.constant';

export type DeferrableWorkspaceMigrationActionHandlerKey =
  (typeof DEFERRABLE_WORKSPACE_MIGRATION_ACTIONS)[number];

type DeferredWorkspaceMigrationActionPayloadByHandlerKey = {
  create_index: { indexMetadataId: string };
  delete_logicFunction: { flatLogicFunction: FlatLogicFunction };
};

export type DeferredWorkspaceMigrationActionPayload<
  TActionHandlerKey extends WorkspaceMigrationActionHandlerKey,
> = TActionHandlerKey extends DeferrableWorkspaceMigrationActionHandlerKey
  ? DeferredWorkspaceMigrationActionPayloadByHandlerKey[TActionHandlerKey]
  : never;

export type PersistedDeferredWorkspaceMigrationAction = {
  actionHandlerKey: DeferrableWorkspaceMigrationActionHandlerKey;
  payload: DeferredWorkspaceMigrationActionPayloadByHandlerKey[DeferrableWorkspaceMigrationActionHandlerKey];
};

export type DeferredWorkspaceMigrationAction = {
  [TActionHandlerKey in DeferrableWorkspaceMigrationActionHandlerKey]: {
    actionHandlerKey: TActionHandlerKey;
    payload: DeferredWorkspaceMigrationActionPayloadByHandlerKey[TActionHandlerKey];
  };
}[DeferrableWorkspaceMigrationActionHandlerKey];
