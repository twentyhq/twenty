import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

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

export type FromCreateLogicFunctionInputToFlatLogicFunctionArgs = {
  createLogicFunctionInput: CreateLogicFunctionInput & {
    logicFunctionLayerId: string;
  };
  workspaceId: string;
  workspaceCustomApplicationId: string;
};

export const fromCreateLogicFunctionInputToFlatLogicFunction = ({
  createLogicFunctionInput: rawCreateLogicFunctionInput,
  workspaceId,
  workspaceCustomApplicationId,
}: FromCreateLogicFunctionInputToFlatLogicFunctionArgs): FlatLogicFunction => {
  const id = v4();
  const currentDate = new Date();

  return {
    id,
    cronTriggerSettings: null,
    databaseEventTriggerSettings: null,
    httpRouteTriggerSettings: null,
    name: rawCreateLogicFunctionInput.name,
    description: rawCreateLogicFunctionInput.description ?? null,
    sourceHandlerPath:
      rawCreateLogicFunctionInput.sourceHandlerPath ??
      DEFAULT_SOURCE_HANDLER_PATH,
    handlerName:
      rawCreateLogicFunctionInput.handlerName ?? DEFAULT_HANDLER_NAME,
    builtHandlerPath:
      rawCreateLogicFunctionInput.builtHandlerPath ??
      DEFAULT_BUILT_HANDLER_PATH,
    universalIdentifier:
      rawCreateLogicFunctionInput.universalIdentifier ?? v4(),
    createdAt: currentDate.toISOString(),
    updatedAt: currentDate.toISOString(),
    deletedAt: null,
    latestVersion: null,
    publishedVersions: [],
    applicationId: workspaceCustomApplicationId,
    runtime: LogicFunctionRuntime.NODE22,
    timeoutSeconds: rawCreateLogicFunctionInput.timeoutSeconds ?? 300,
    logicFunctionLayerId: rawCreateLogicFunctionInput.logicFunctionLayerId,
    workspaceId,
    code: rawCreateLogicFunctionInput?.code,
    checksum: rawCreateLogicFunctionInput?.code
      ? logicFunctionCreateHash(
          JSON.stringify(rawCreateLogicFunctionInput.code),
        )
      : null,
    // If no schema provided and no code provided, use default schema
    // (because the default template will be used)
    toolInputSchema: isDefined(rawCreateLogicFunctionInput?.toolInputSchema)
      ? rawCreateLogicFunctionInput.toolInputSchema
      : !isDefined(rawCreateLogicFunctionInput?.code)
        ? DEFAULT_TOOL_INPUT_SCHEMA
        : null,
    isTool: rawCreateLogicFunctionInput?.isTool ?? false,
  };
};
