import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

type DeferredWorkspaceOperationPayloadByName = {
  build_index: { indexMetadataId: string };
  validate_foreignKey: { fieldMetadataId: string };
  delete_logicFunctionResources: { flatLogicFunction: FlatLogicFunction };
  delete_workflowRuns: {
    coreWorkflowId: string;
    coreWorkflowVersionId?: string;
  };
};

export type DeferredWorkspaceOperationName =
  keyof DeferredWorkspaceOperationPayloadByName;

export type DeferredWorkspaceOperationPayload<
  TName extends DeferredWorkspaceOperationName,
> = DeferredWorkspaceOperationPayloadByName[TName];

export type PersistedDeferredWorkspaceOperation = {
  name: DeferredWorkspaceOperationName;
  payload: DeferredWorkspaceOperationPayloadByName[DeferredWorkspaceOperationName];
};

export type DeferredWorkspaceOperation = {
  [TName in DeferredWorkspaceOperationName]: {
    name: TName;
    payload: DeferredWorkspaceOperationPayloadByName[TName];
  };
}[DeferredWorkspaceOperationName];
