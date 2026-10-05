import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum AiExceptionCode {
  AGENT_NOT_FOUND = 'AGENT_NOT_FOUND',
  AGENT_ALREADY_EXISTS = 'AGENT_ALREADY_EXISTS',
  AGENT_IS_STANDARD = 'AGENT_IS_STANDARD',
  AGENT_EXECUTION_FAILED = 'AGENT_EXECUTION_FAILED',
  INVALID_AGENT_INPUT = 'INVALID_AGENT_INPUT',
  THREAD_NOT_FOUND = 'THREAD_NOT_FOUND',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  WORKSPACE_NOT_FOUND = 'WORKSPACE_NOT_FOUND',
  CONTEXT_WINDOW_EXCEEDED = 'CONTEXT_WINDOW_EXCEEDED',
  INVALID_CHAT_THREAD_TITLE = 'INVALID_CHAT_THREAD_TITLE',
  INVALID_CHAT_THREAD_SNOOZE_TIME = 'INVALID_CHAT_THREAD_SNOOZE_TIME',
  CHAT_THREAD_INBOX_STATE_UNAVAILABLE = 'CHAT_THREAD_INBOX_STATE_UNAVAILABLE',
  MESSAGE_NOT_FOUND = 'MESSAGE_NOT_FOUND',
  INVALID_TOOL_CALL_OUTPUT = 'INVALID_TOOL_CALL_OUTPUT',
  TOOL_CALL_NOT_FOUND = 'TOOL_CALL_NOT_FOUND',
  TOOL_CALL_NOT_PENDING = 'TOOL_CALL_NOT_PENDING',
  API_KEY_NOT_CONFIGURED = 'API_KEY_NOT_CONFIGURED',
  USER_WORKSPACE_ID_NOT_FOUND = 'USER_WORKSPACE_ID_NOT_FOUND',
  ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
  ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS = 'ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS',
  RUN_AS_WORKSPACE_MEMBER_NOT_ALLOWED = 'RUN_AS_WORKSPACE_MEMBER_NOT_ALLOWED',
  RUN_AS_WORKSPACE_MEMBER_NOT_FOUND = 'RUN_AS_WORKSPACE_MEMBER_NOT_FOUND',
  RUN_AGENT_NOT_ALLOWED = 'RUN_AGENT_NOT_ALLOWED',
  NO_FAILED_TURN_TO_RETRY = 'NO_FAILED_TURN_TO_RETRY',
  STREAM_INTERRUPTED = 'STREAM_INTERRUPTED',
  EVALUATION_MODEL_NOT_FOUND = 'EVALUATION_MODEL_NOT_FOUND',
  EVALUATION_QUESTION_UNSUPPORTED = 'EVALUATION_QUESTION_UNSUPPORTED',
  INVALID_EVALUATION_REQUEST = 'INVALID_EVALUATION_REQUEST',
  TOOL_CALL_RESOLUTION_FORBIDDEN = 'TOOL_CALL_RESOLUTION_FORBIDDEN',
  THREAD_AWAITING_WORKFLOW_INPUT = 'THREAD_AWAITING_WORKFLOW_INPUT',
  THREAD_AWAITING_ANSWER = 'THREAD_AWAITING_ANSWER',
}

const getAiExceptionUserFriendlyMessage = (code: AiExceptionCode) => {
  switch (code) {
    case AiExceptionCode.AGENT_NOT_FOUND:
      return msg`Agent not found.`;
    case AiExceptionCode.AGENT_ALREADY_EXISTS:
      return msg`An agent with this name already exists.`;
    case AiExceptionCode.AGENT_IS_STANDARD:
      return msg`Standard agents cannot be modified.`;
    case AiExceptionCode.AGENT_EXECUTION_FAILED:
      return msg`Agent execution failed.`;
    case AiExceptionCode.INVALID_AGENT_INPUT:
      return msg`Invalid agent input.`;
    case AiExceptionCode.THREAD_NOT_FOUND:
      return msg`Chat thread not found.`;
    case AiExceptionCode.RECORD_NOT_FOUND:
      return msg`Record not found.`;
    case AiExceptionCode.WORKSPACE_NOT_FOUND:
      return msg`Workspace not found.`;
    case AiExceptionCode.CONTEXT_WINDOW_EXCEEDED:
      return msg`This conversation is too long for the model. Start a new thread to continue.`;
    case AiExceptionCode.INVALID_CHAT_THREAD_TITLE:
      return msg`Chat thread title cannot be empty.`;
    case AiExceptionCode.INVALID_CHAT_THREAD_SNOOZE_TIME:
      return msg`Snooze time must be in the future.`;
    case AiExceptionCode.CHAT_THREAD_INBOX_STATE_UNAVAILABLE:
      return msg`Read, archive and snooze are not available yet. Try again in a few minutes.`;
    case AiExceptionCode.MESSAGE_NOT_FOUND:
      return msg`Chat message not found.`;
    case AiExceptionCode.INVALID_TOOL_CALL_OUTPUT:
      return msg`Invalid answer for this request.`;
    case AiExceptionCode.TOOL_CALL_NOT_FOUND:
      return msg`This request for input could not be found.`;
    case AiExceptionCode.TOOL_CALL_NOT_PENDING:
      return msg`This request is no longer waiting for an answer.`;
    case AiExceptionCode.API_KEY_NOT_CONFIGURED:
      return msg`API key is not configured.`;
    case AiExceptionCode.USER_WORKSPACE_ID_NOT_FOUND:
      return msg`User workspace not found.`;
    case AiExceptionCode.ROLE_NOT_FOUND:
      return msg`Role not found.`;
    case AiExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS:
      return msg`This role cannot be assigned to agents.`;
    case AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_ALLOWED:
      return msg`This action is not available for your request.`;
    case AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_FOUND:
      return msg`Workspace member not found.`;
    case AiExceptionCode.RUN_AGENT_NOT_ALLOWED:
      return msg`This action is not available for your request.`;
    case AiExceptionCode.NO_FAILED_TURN_TO_RETRY:
      return msg`There is no failed message to retry.`;
    case AiExceptionCode.STREAM_INTERRUPTED:
      return msg`The response was interrupted before it could finish.`;
    case AiExceptionCode.EVALUATION_MODEL_NOT_FOUND:
      return msg`No classification model is configured.`;
    case AiExceptionCode.EVALUATION_QUESTION_UNSUPPORTED:
      return msg`This model cannot answer one of the questions asked.`;
    case AiExceptionCode.INVALID_EVALUATION_REQUEST:
      return msg`Invalid classification request.`;
    case AiExceptionCode.TOOL_CALL_RESOLUTION_FORBIDDEN:
      return msg`You are not allowed to answer this request.`;
    case AiExceptionCode.THREAD_AWAITING_WORKFLOW_INPUT:
      return msg`This workflow is waiting for an answer. Answer it before sending a message.`;
    case AiExceptionCode.THREAD_AWAITING_ANSWER:
      return msg`This conversation is waiting for an answer to an earlier request.`;
    default:
      assertUnreachable(code);
  }
};
const AI_EXCEPTION_CATEGORY_BY_CODE = {
  [AiExceptionCode.AGENT_NOT_FOUND]: 'NOT_FOUND',
  [AiExceptionCode.AGENT_ALREADY_EXISTS]: 'CONFLICT',
  [AiExceptionCode.AGENT_IS_STANDARD]: 'FORBIDDEN',
  [AiExceptionCode.AGENT_EXECUTION_FAILED]: 'INTERNAL_SERVER_ERROR',
  [AiExceptionCode.INVALID_AGENT_INPUT]: 'BAD_USER_INPUT',
  [AiExceptionCode.THREAD_NOT_FOUND]: 'NOT_FOUND',
  [AiExceptionCode.RECORD_NOT_FOUND]: 'NOT_FOUND',
  [AiExceptionCode.WORKSPACE_NOT_FOUND]: 'NOT_FOUND',
  [AiExceptionCode.CONTEXT_WINDOW_EXCEEDED]: 'BAD_USER_INPUT',
  [AiExceptionCode.INVALID_CHAT_THREAD_TITLE]: 'BAD_USER_INPUT',
  [AiExceptionCode.INVALID_CHAT_THREAD_SNOOZE_TIME]: 'BAD_USER_INPUT',
  [AiExceptionCode.CHAT_THREAD_INBOX_STATE_UNAVAILABLE]: 'CONFLICT',
  [AiExceptionCode.MESSAGE_NOT_FOUND]: 'NOT_FOUND',
  [AiExceptionCode.INVALID_TOOL_CALL_OUTPUT]: 'BAD_USER_INPUT',
  [AiExceptionCode.TOOL_CALL_NOT_FOUND]: 'NOT_FOUND',
  [AiExceptionCode.TOOL_CALL_NOT_PENDING]: 'BAD_USER_INPUT',
  [AiExceptionCode.API_KEY_NOT_CONFIGURED]: 'SERVICE_UNAVAILABLE',
  [AiExceptionCode.USER_WORKSPACE_ID_NOT_FOUND]: 'NOT_FOUND',
  [AiExceptionCode.ROLE_NOT_FOUND]: 'NOT_FOUND',
  [AiExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS]: 'FORBIDDEN',
  [AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_ALLOWED]: 'FORBIDDEN',
  [AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_FOUND]: 'NOT_FOUND',
  [AiExceptionCode.RUN_AGENT_NOT_ALLOWED]: 'FORBIDDEN',
  [AiExceptionCode.NO_FAILED_TURN_TO_RETRY]: 'CONFLICT',
  [AiExceptionCode.STREAM_INTERRUPTED]: 'INTERNAL_SERVER_ERROR',
  [AiExceptionCode.EVALUATION_MODEL_NOT_FOUND]: 'NOT_FOUND',
  [AiExceptionCode.EVALUATION_QUESTION_UNSUPPORTED]: 'BAD_USER_INPUT',
  [AiExceptionCode.INVALID_EVALUATION_REQUEST]: 'BAD_USER_INPUT',
  [AiExceptionCode.TOOL_CALL_RESOLUTION_FORBIDDEN]: 'FORBIDDEN',
  [AiExceptionCode.THREAD_AWAITING_WORKFLOW_INPUT]: 'CONFLICT',
  [AiExceptionCode.THREAD_AWAITING_ANSWER]: 'CONFLICT',
} as const satisfies Record<AiExceptionCode, ExceptionCategory>;

export class AiException extends CustomException<AiExceptionCode> {
  constructor(
    message: string,
    code: AiExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getAiExceptionUserFriendlyMessage(code),
      category: AI_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
