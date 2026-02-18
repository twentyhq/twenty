import { type LogicFunctionDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function.dto';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export const fromFlatLogicFunctionToLogicFunctionDto = ({
  flatLogicFunction,
}: {
  flatLogicFunction: FlatLogicFunction;
}): LogicFunctionDTO => {
  return {
    id: flatLogicFunction.id,
    universalIdentifier: flatLogicFunction.universalIdentifier,
    name: flatLogicFunction.name,
    description: flatLogicFunction.description ?? undefined,
    runtime: flatLogicFunction.runtime,
    timeoutSeconds: flatLogicFunction.timeoutSeconds,
    sourceHandlerPath: flatLogicFunction.sourceHandlerPath,
    handlerName: flatLogicFunction.handlerName,
    toolInputSchema: flatLogicFunction.toolInputSchema ?? undefined,
    isTool: flatLogicFunction.isTool,
    applicationId: flatLogicFunction.applicationId ?? undefined,
    workspaceId: flatLogicFunction.workspaceId,
    createdAt: new Date(flatLogicFunction.createdAt),
    updatedAt: new Date(flatLogicFunction.updatedAt),
    cronTriggerSettings: flatLogicFunction.cronTriggerSettings ?? undefined,
    databaseEventTriggerSettings:
      flatLogicFunction.databaseEventTriggerSettings ?? undefined,
    httpRouteTriggerSettings:
      flatLogicFunction.httpRouteTriggerSettings ?? undefined,
  };
};
