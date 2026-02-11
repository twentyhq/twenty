import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { LogicFunctionRuntime } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { type CreateLogicFunction } from 'src/engine/metadata-modules/logic-function/dtos/create-logic-function.input';

export type FromCreateLogicFunctionInputToFlatLogicFunctionArgs = {
  createLogicFunctionInput: CreateLogicFunction;
  workspaceId: string;
  ownerFlatApplication: FlatApplication;
};

export const fromCreateLogicFunctionInputToFlatLogicFunction = ({
  createLogicFunctionInput: rawCreateLogicFunctionInput,
  workspaceId,
  ownerFlatApplication,
}: FromCreateLogicFunctionInputToFlatLogicFunctionArgs): FlatLogicFunction => {
  const id = rawCreateLogicFunctionInput.id ?? v4();
  const currentDate = new Date();

  const universalIdentifier =
    rawCreateLogicFunctionInput.universalIdentifier ?? v4();

  return {
    id,
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
    universalIdentifier,
    createdAt: currentDate.toISOString(),
    updatedAt: currentDate.toISOString(),
    deletedAt: null,
    applicationId: ownerFlatApplication.id,
    runtime: LogicFunctionRuntime.NODE22,
    timeoutSeconds: rawCreateLogicFunctionInput.timeoutSeconds ?? 300,
    workspaceId,
    checksum: rawCreateLogicFunctionInput.checksum ?? null,
    toolInputSchema: rawCreateLogicFunctionInput.toolInputSchema ?? null,
    isTool: rawCreateLogicFunctionInput?.isTool ?? false,
    isBuildUpToDate: rawCreateLogicFunctionInput.isBuildUpToDate,
    applicationUniversalIdentifier: ownerFlatApplication.universalIdentifier,
  };
};
