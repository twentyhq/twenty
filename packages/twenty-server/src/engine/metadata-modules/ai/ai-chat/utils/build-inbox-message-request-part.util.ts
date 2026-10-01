import { isNonEmptyString } from '@sniptt/guards';
import {
  ASK_QUESTIONS_TOOL_NAME,
  type ExtendedUIMessagePart,
  PROPOSE_EMAIL_TOOL_NAME,
  REQUEST_FORM_TOOL_NAME,
} from 'twenty-shared/ai';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { type z } from 'zod';

import { buildLogicFunctionToolName } from 'src/engine/core-modules/tool-provider/utils/build-logic-function-tool-name.util';
import {
  askQuestionsInputSchema,
  buildAskQuestionsPendingOutput,
} from 'src/engine/metadata-modules/ai/ai-chat/tools/ask-questions.tool';
import {
  buildProposeEmailPendingOutput,
  proposeEmailInputSchema,
} from 'src/engine/metadata-modules/ai/ai-chat/tools/propose-email.tool';
import {
  buildRequestFormPendingOutput,
  requestFormInputSchema,
} from 'src/engine/metadata-modules/ai/ai-chat/tools/request-form.tool';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

type InboxMessageRequestPart = {
  part: ExtendedUIMessagePart;
  isAwaitingAnswer: boolean;
};

const throwInvalidRequest = (reason: string): never => {
  throw new AiException(
    `Invalid inbox message request: ${reason}`,
    AiExceptionCode.INVALID_AGENT_INPUT,
  );
};

const parseInput = <TInput>(schema: z.ZodType<TInput>, input: unknown) => {
  const parseResult = schema.safeParse(input);

  return parseResult.success
    ? parseResult.data
    : throwInvalidRequest(parseResult.error.message);
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
    : throwInvalidRequest(`${name} must be an object`);
};

const buildToolPart = ({
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

const buildPausingToolPart = ({
  toolName,
  toolCallId,
  input,
}: {
  toolName: unknown;
  toolCallId: string;
  input: unknown;
}): ExtendedUIMessagePart => {
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
    case PROPOSE_EMAIL_TOOL_NAME: {
      const email = parseInput(proposeEmailInputSchema, input);

      return buildToolPart({
        toolName,
        toolCallId,
        input: email,
        output: buildProposeEmailPendingOutput(email),
      });
    }
    default:
      return throwInvalidRequest(
        `toolName must be ${ASK_QUESTIONS_TOOL_NAME}, ${REQUEST_FORM_TOOL_NAME} or ${PROPOSE_EMAIL_TOOL_NAME}`,
      );
  }
};

// A request is either a call the member answers, which pauses the
// conversation, or one of the application's own tools, rendered by its front
// component with the input and output the application gives. The caller
// resolves that tool, scoped to the sending application.
export const buildInboxMessageRequestPart = ({
  request,
  toolCallId,
  applicationTool,
}: {
  request: unknown;
  toolCallId: string;
  applicationTool?: FlatLogicFunction;
}): InboxMessageRequestPart => {
  if (!isPlainObject(request)) {
    return throwInvalidRequest('request must be an object');
  }

  if (!isNonEmptyString(request.logicFunctionUniversalIdentifier)) {
    return {
      part: buildPausingToolPart({
        toolName: request.toolName,
        toolCallId,
        input: request.input,
      }),
      isAwaitingAnswer: true,
    };
  }

  if (isDefined(request.toolName)) {
    return throwInvalidRequest(
      'set either toolName or logicFunctionUniversalIdentifier, not both',
    );
  }

  const input = parseOptionalRecord('input', request.input);
  const output = parseOptionalRecord('output', request.output);

  if (
    applicationTool?.universalIdentifier !==
      request.logicFunctionUniversalIdentifier ||
    !isDefined(
      applicationTool.toolTriggerSettings?.frontComponentUniversalIdentifier,
    )
  ) {
    return throwInvalidRequest(
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
