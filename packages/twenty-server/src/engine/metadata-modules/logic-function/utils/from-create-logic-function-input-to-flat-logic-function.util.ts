import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { DEFAULT_TOOL_INPUT_SCHEMA } from 'src/engine/metadata-modules/logic-function/constants/default-tool-input-schema.constant';
import { type CreateLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/create-logic-function.input';
import {
  DEFAULT_BUILT_HANDLER_PATH,
  DEFAULT_HANDLER_NAME,
  DEFAULT_SOURCE_HANDLER_PATH,
  LogicFunctionRuntime,
} from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { logicFunctionCreateHash } from 'src/engine/metadata-modules/logic-function/utils/logic-function-create-hash.utils';

const WORKFLOW_BASE_FOLDER_PREFIX = 'workflow';

export type FromCreateLogicFunctionInputToFlatLogicFunctionArgs = {
  createLogicFunctionInput: CreateLogicFunctionInput;
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

  // Build full paths including the base folder
  const baseFolder = `${WORKFLOW_BASE_FOLDER_PREFIX}/${id}`;
  const sourceHandlerPath =
    rawCreateLogicFunctionInput.sourceHandlerPath ??
    `${baseFolder}/${DEFAULT_SOURCE_HANDLER_PATH}`;
  const builtHandlerPath =
    rawCreateLogicFunctionInput.builtHandlerPath ??
    `${baseFolder}/${DEFAULT_BUILT_HANDLER_PATH}`;

  const universalIdentifier =
    rawCreateLogicFunctionInput.universalIdentifier ?? v4();

  const checksum = isDefined(rawCreateLogicFunctionInput.checksum)
    ? rawCreateLogicFunctionInput.checksum
    : rawCreateLogicFunctionInput?.code
      ? logicFunctionCreateHash(
          JSON.stringify(rawCreateLogicFunctionInput.code),
        )
      : null;

  return {
    id,
    cronTriggerSettings: null,
    databaseEventTriggerSettings: null,
    httpRouteTriggerSettings: null,
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
    code: rawCreateLogicFunctionInput?.code,
    checksum,
    // If no schema provided and no code provided, use default schema
    // (because the default template will be used)
    toolInputSchema: isDefined(rawCreateLogicFunctionInput?.toolInputSchema)
      ? rawCreateLogicFunctionInput.toolInputSchema
      : !isDefined(rawCreateLogicFunctionInput?.code)
        ? DEFAULT_TOOL_INPUT_SCHEMA
        : null,
    isTool: rawCreateLogicFunctionInput?.isTool ?? false,
    __universal: {
      applicationUniversalIdentifier: ownerFlatApplication.universalIdentifier,
      universalIdentifier,
    },
  };
};
