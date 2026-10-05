import { isNonEmptyString, isString } from '@sniptt/guards';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { buildLogicFunctionToolName } from 'src/engine/core-modules/tool-provider/utils/build-logic-function-tool-name.util';
import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';
import { type PausingToolCallContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-call-context.type';
import { buildToolPart } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-tool-part.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

type InboxMessageToolCallPart = {
  part: ExtendedUIMessagePart;
  isAwaitingAnswer: boolean;
};

const throwInvalidToolCall = (reason: string): never => {
  throw new AiException(
    `Invalid inbox message tool call: ${reason}`,
    AiExceptionCode.INVALID_AGENT_INPUT,
  );
};

const parseOptionalRecord = (
  name: string,
  value: unknown,
): Record<string, unknown> => {
  if (!isDefined(value)) {
    return {};
  }

  return isPlainObject(value)
    ? value
    : throwInvalidToolCall(`${name} must be an object`);
};

const buildPausingToolPart = async ({
  toolName,
  toolCallId,
  input,
  context,
}: {
  toolName: unknown;
  toolCallId: string;
  input: unknown;
  context: PausingToolCallContext;
}): Promise<ExtendedUIMessagePart> => {
  const pausingTool = isString(toolName)
    ? PAUSING_TOOLS.get(toolName)
    : undefined;

  if (!isString(toolName) || !isDefined(pausingTool)) {
    return throwInvalidToolCall(
      `toolName must be one of ${[...PAUSING_TOOLS.keys()].join(', ')}`,
    );
  }

  const preparedCall = await pausingTool.prepareCall(input, context);

  if ('error' in preparedCall) {
    return throwInvalidToolCall(preparedCall.error);
  }

  return buildToolPart({
    toolName,
    toolCallId,
    input: preparedCall.input,
    output: preparedCall.pendingOutput,
  });
};

// A tool call is either one the member answers, which pauses the
// conversation, or one of the application's own tools, rendered by its front
// component with the input and output the application gives. The caller
// resolves that tool, and any proposed call, scoped to the sending application.
export const buildInboxMessageToolCallPart = async ({
  toolCall,
  toolCallId,
  findApplicationTool,
  context,
}: {
  toolCall: unknown;
  toolCallId: string;
  findApplicationTool: (
    logicFunctionUniversalIdentifier: string,
  ) => Promise<FlatLogicFunction | undefined>;
  context: PausingToolCallContext;
}): Promise<InboxMessageToolCallPart> => {
  if (!isPlainObject(toolCall)) {
    return throwInvalidToolCall('toolCall must be an object');
  }

  if (!isNonEmptyString(toolCall.logicFunctionUniversalIdentifier)) {
    return {
      part: await buildPausingToolPart({
        toolName: toolCall.toolName,
        toolCallId,
        input: toolCall.input,
        context,
      }),
      isAwaitingAnswer: true,
    };
  }

  if (isDefined(toolCall.toolName)) {
    return throwInvalidToolCall(
      'set either toolName or logicFunctionUniversalIdentifier, not both',
    );
  }

  const input = parseOptionalRecord('input', toolCall.input);
  const output = parseOptionalRecord('output', toolCall.output);
  const applicationTool = await findApplicationTool(
    toolCall.logicFunctionUniversalIdentifier,
  );

  if (
    !isDefined(applicationTool) ||
    !isDefined(
      applicationTool.toolTriggerSettings?.frontComponentUniversalIdentifier,
    )
  ) {
    return throwInvalidToolCall(
      'logicFunctionUniversalIdentifier must name a tool of this application that has a front component',
    );
  }

  return {
    part: buildToolPart({
      toolName: buildLogicFunctionToolName(applicationTool.name),
      toolCallId,
      input,
      output,
    }),
    isAwaitingAnswer: false,
  };
};
