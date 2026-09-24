import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

type DeferredWorkspaceMigrationActionPayloadByName = {
  build_index: { indexMetadataId: string };
  validate_foreignKey: { fieldMetadataId: string };
  delete_logicFunctionResources: { flatLogicFunction: FlatLogicFunction };
};

export type DeferredWorkspaceMigrationActionName =
  keyof DeferredWorkspaceMigrationActionPayloadByName;

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
