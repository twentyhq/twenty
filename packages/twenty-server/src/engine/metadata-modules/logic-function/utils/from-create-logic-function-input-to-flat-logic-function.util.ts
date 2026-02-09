import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CreateLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/create-logic-function.input';
import {
  DEFAULT_HANDLER_NAME,
  LogicFunctionRuntime,
} from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export type FromCreateLogicFunctionInputToFlatLogicFunctionArgs = {
  createLogicFunctionInput: Omit<CreateLogicFunctionInput, 'applicationId'>;
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

  const sourceHandlerPath = rawCreateLogicFunctionInput.sourceHandlerPath;
  const builtHandlerPath = rawCreateLogicFunctionInput.builtHandlerPath;

  const universalIdentifier =
    rawCreateLogicFunctionInput.universalIdentifier ?? v4();

  const checksum = rawCreateLogicFunctionInput.checksum;

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
    sourceHandlerPath,
    handlerName:
      rawCreateLogicFunctionInput.handlerName ?? DEFAULT_HANDLER_NAME,
    builtHandlerPath,
    universalIdentifier,
    createdAt: currentDate.toISOString(),
    updatedAt: currentDate.toISOString(),
    deletedAt: null,
    applicationId: ownerFlatApplication.id,
    runtime: LogicFunctionRuntime.NODE22,
    timeoutSeconds: rawCreateLogicFunctionInput.timeoutSeconds ?? 300,
    workspaceId,
    checksum,
    toolInputSchema: rawCreateLogicFunctionInput.toolInputSchema ?? null,
    isTool: rawCreateLogicFunctionInput?.isTool ?? false,
    applicationUniversalIdentifier: ownerFlatApplication.universalIdentifier,
  };
};
