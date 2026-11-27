import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type LogicFunctionDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function.dto';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { printDatabaseEventTriggerSettings } from 'src/engine/workspace-event-emitter/utils/print-database-event-trigger-settings.util';

export const fromFlatLogicFunctionToLogicFunctionDto = ({
  flatLogicFunction,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatLogicFunction: FlatLogicFunction;
} & Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
>): LogicFunctionDTO => {
  return {
    id: flatLogicFunction.id,
    universalIdentifier: flatLogicFunction.universalIdentifier,
    name: flatLogicFunction.name,
    description: flatLogicFunction.description ?? undefined,
    runtime: flatLogicFunction.runtime,
    timeoutSeconds: flatLogicFunction.timeoutSeconds,
    executionMode: flatLogicFunction.executionMode,
    sourceHandlerPath: flatLogicFunction.sourceHandlerPath,
    handlerName: flatLogicFunction.handlerName,
    applicationId: flatLogicFunction.applicationId ?? undefined,
    workspaceId: flatLogicFunction.workspaceId,
    createdAt: new Date(flatLogicFunction.createdAt),
    updatedAt: new Date(flatLogicFunction.updatedAt),
    cronTriggerSettings: flatLogicFunction.cronTriggerSettings ?? undefined,
    databaseEventTriggerSettings: isDefined(
      flatLogicFunction.databaseEventTriggerSettings,
    )
      ? printDatabaseEventTriggerSettings({
          settings: flatLogicFunction.databaseEventTriggerSettings,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        })
      : undefined,
    httpRouteTriggerSettings:
      flatLogicFunction.httpRouteTriggerSettings ?? undefined,
    toolTriggerSettings: flatLogicFunction.toolTriggerSettings ?? undefined,
    workflowActionTriggerSettings:
      flatLogicFunction.workflowActionTriggerSettings ?? undefined,
  };
};
