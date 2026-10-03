import { isNonEmptyString } from '@sniptt/guards';
import {
  ASK_QUESTIONS_TOOL_NAME,
  type ExtendedUIMessagePart,
  PROPOSE_TOOL_CALL_TOOL_NAME,
  type ProposeToolCallToolInput,
  REQUEST_FORM_TOOL_NAME,
} from 'twenty-shared/ai';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { type z } from 'zod';

import { buildLogicFunctionToolName } from 'src/engine/core-modules/tool-provider/utils/build-logic-function-tool-name.util';
import { type ProposedToolCallResolution } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/resolve-proposed-tool-call.util';
import {
  askQuestionsInputSchema,
  buildAskQuestionsPendingOutput,
} from 'src/engine/metadata-modules/ai/ai-chat/tools/ask-questions.tool';
import {
  buildProposeToolCallPendingOutput,
  proposeToolCallInputSchema,
} from 'src/engine/metadata-modules/ai/ai-chat/tools/propose-tool-call.tool';
import {
  buildRequestFormPendingOutput,
  requestFormInputSchema,
} from 'src/engine/metadata-modules/ai/ai-chat/tools/request-form.tool';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export type ResolveInboxProposal = (
  input: ProposeToolCallToolInput,
) => Promise<ProposedToolCallResolution>;

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

const parseInput = <TInput>(schema: z.ZodType<TInput>, input: unknown) => {
  const parseResult = schema.safeParse(input);

  return parseResult.success
    ? parseResult.data
    : throwInvalidToolCall(parseResult.error.message);
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

export const buildToolPart = ({
  toolName,
  toolCallId,
  input,
  output,
}: {
  toolName: string;
  toolCallId: string;
  input: unknown;
  output: unknown;
}): ExtendedUIMessagePart => ({
  type: `tool-${toolName}`,
  toolCallId,
  state: 'output-available',
  input,
  output,
});

const buildPausingToolPart = async ({
  toolName,
  toolCallId,
  input,
  resolveProposal,
}: {
  toolName: unknown;
  toolCallId: string;
  input: unknown;
  resolveProposal: ResolveInboxProposal;
}): Promise<ExtendedUIMessagePart> => {
  switch (toolName) {
    case ASK_QUESTIONS_TOOL_NAME: {
      const questionsInput = parseInput(askQuestionsInputSchema, input);

      return buildToolPart({
        toolName,
        toolCallId,
        input: questionsInput,
        output: buildAskQuestionsPendingOutput(questionsInput),
      });
    }
    case REQUEST_FORM_TOOL_NAME:
      return buildToolPart({
        toolName,
        toolCallId,
        input: parseInput(requestFormInputSchema, input),
        output: buildRequestFormPendingOutput(),
      });
    case PROPOSE_TOOL_CALL_TOOL_NAME: {
      const proposeToolCallInput = parseInput(
        proposeToolCallInputSchema,
        input,
      );
      const resolution = await resolveProposal(proposeToolCallInput);

      if ('error' in resolution) {
        return throwInvalidToolCall(resolution.error);
      }

      return buildToolPart({
        toolName,
        toolCallId,
        input: proposeToolCallInput,
        output: buildProposeToolCallPendingOutput(resolution.proposal),
      });
    }
    default:
      return throwInvalidToolCall(
        `toolName must be ${ASK_QUESTIONS_TOOL_NAME}, ${REQUEST_FORM_TOOL_NAME} or ${PROPOSE_TOOL_CALL_TOOL_NAME}`,
      );
  }
};

// A tool call is either one the member answers, which pauses the
// conversation, or one of the application's own tools, rendered by its front
// component with the input and output the application gives. The caller
// resolves that tool, and any proposed call, scoped to the sending application.
export const buildInboxMessageToolCallPart = async ({
  toolCall,
  toolCallId,
  findApplicationTool,
  resolveProposal,
}: {
  toolCall: unknown;
  toolCallId: string;
  findApplicationTool: (
    logicFunctionUniversalIdentifier: string,
  ) => Promise<FlatLogicFunction | undefined>;
  resolveProposal: ResolveInboxProposal;
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
        resolveProposal,
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
