import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_MESSAGE_TOOL_CALLS_MAX_COUNT } from 'src/engine/metadata-modules/ai/ai-chat/constants/inbox-message-tool-calls-max-count.constant';
import { type ResolveInboxProposal } from 'src/engine/metadata-modules/ai/ai-chat/types/resolve-inbox-proposal.type';
import { buildInboxMessageToolCallId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-tool-call-id.util';
import { buildInboxMessageToolCallPart } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-tool-call-part.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

type InboxMessageToolCallParts = {
  parts: ExtendedUIMessagePart[];
  isAwaitingAnswer: boolean;
};

const throwInvalidToolCalls = (reason: string): never => {
  throw new AiException(
    `Invalid inbox message tool calls: ${reason}`,
    AiExceptionCode.INVALID_AGENT_INPUT,
  );
};

const listToolCalls = ({
  toolCall,
  toolCalls,
}: {
  toolCall: unknown;
  toolCalls: unknown;
}): unknown[] => {
  if (!isDefined(toolCalls)) {
    return isDefined(toolCall) ? [toolCall] : [];
  }

  if (isDefined(toolCall)) {
    return throwInvalidToolCalls('set either toolCall or toolCalls, not both');
  }

  if (!Array.isArray(toolCalls)) {
    return throwInvalidToolCalls('toolCalls must be a list');
  }

  if (toolCalls.length > INBOX_MESSAGE_TOOL_CALLS_MAX_COUNT) {
    return throwInvalidToolCalls(
      `toolCalls can hold at most ${INBOX_MESSAGE_TOOL_CALLS_MAX_COUNT} calls`,
    );
  }

  return toolCalls;
};

// The calls are parts of one message, so those the member answers stack like
// the calls the assistant makes in one step, and the message waits on them.
export const buildInboxMessageToolCallParts = async ({
  toolCall,
  toolCalls,
  messageId,
  findApplicationTool,
  resolveProposal,
}: {
  toolCall: unknown;
  toolCalls: unknown;
  messageId: string;
  findApplicationTool: (
    logicFunctionUniversalIdentifier: string,
  ) => Promise<FlatLogicFunction | undefined>;
  resolveProposal: ResolveInboxProposal;
}): Promise<InboxMessageToolCallParts> => {
  const toolCallParts = await Promise.all(
    listToolCalls({ toolCall, toolCalls }).map((listedToolCall, position) =>
      buildInboxMessageToolCallPart({
        toolCall: listedToolCall,
        toolCallId: buildInboxMessageToolCallId({ messageId, position }),
        findApplicationTool,
        resolveProposal,
      }),
    ),
  );

  return {
    parts: toolCallParts.map(({ part }) => part),
    isAwaitingAnswer: toolCallParts.some(
      ({ isAwaitingAnswer }) => isAwaitingAnswer,
    ),
  };
};
