import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CreateLogicFunction } from 'src/engine/metadata-modules/logic-function/dtos/create-logic-function.input';
import { LogicFunctionRuntime } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type UniversalFlatLogicFunction } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-logic-function.type';

export type FromCreateLogicFunctionInputToFlatLogicFunctionArgs = {
  createLogicFunctionInput: CreateLogicFunction;
  ownerFlatApplication: FlatApplication;
};

export const fromCreateLogicFunctionInputToFlatLogicFunction = ({
  createLogicFunctionInput: rawCreateLogicFunctionInput,
  ownerFlatApplication,
}: FromCreateLogicFunctionInputToFlatLogicFunctionArgs): UniversalFlatLogicFunction => {
  const currentDate = new Date();

  return {
    cronTriggerSettings:
      rawCreateLogicFunctionInput.cronTriggerSettings ?? null,
    databaseEventTriggerSettings:
      rawCreateLogicFunctionInput.databaseEventTriggerSettings ?? null,
    httpRouteTriggerSettings:
      rawCreateLogicFunctionInput.httpRouteTriggerSettings ?? null,
    name: rawCreateLogicFunctionInput.name,
    description: rawCreateLogicFunctionInput.description ?? null,
    sourceHandlerPath: rawCreateLogicFunctionInput.sourceHandlerPath,
    handlerName: rawCreateLogicFunctionInput.handlerName,
    builtHandlerPath: rawCreateLogicFunctionInput.builtHandlerPath,
    universalIdentifier:
      rawCreateLogicFunctionInput.universalIdentifier ?? v4(),
    createdAt: currentDate.toISOString(),
    updatedAt: currentDate.toISOString(),
    deletedAt: null,
    runtime: LogicFunctionRuntime.NODE22,
    timeoutSeconds: rawCreateLogicFunctionInput.timeoutSeconds ?? 300,
    checksum: rawCreateLogicFunctionInput.checksum ?? null,
    toolInputSchema: rawCreateLogicFunctionInput.toolInputSchema ?? null,
    isTool: rawCreateLogicFunctionInput?.isTool ?? false,
    isBuildUpToDate: rawCreateLogicFunctionInput.isBuildUpToDate,
    applicationUniversalIdentifier: ownerFlatApplication.universalIdentifier,
  };
};
