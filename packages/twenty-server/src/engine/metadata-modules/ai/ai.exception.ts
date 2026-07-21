import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum AiExceptionCode {
  AGENT_NOT_FOUND = 'AGENT_NOT_FOUND',
  AGENT_ALREADY_EXISTS = 'AGENT_ALREADY_EXISTS',
  AGENT_IS_STANDARD = 'AGENT_IS_STANDARD',
  AGENT_EXECUTION_FAILED = 'AGENT_EXECUTION_FAILED',
  INVALID_AGENT_INPUT = 'INVALID_AGENT_INPUT',
  THREAD_NOT_FOUND = 'THREAD_NOT_FOUND',
  WORKSPACE_NOT_FOUND = 'WORKSPACE_NOT_FOUND',
  CONTEXT_WINDOW_EXCEEDED = 'CONTEXT_WINDOW_EXCEEDED',
  INVALID_CHAT_THREAD_TITLE = 'INVALID_CHAT_THREAD_TITLE',
  MESSAGE_NOT_FOUND = 'MESSAGE_NOT_FOUND',
  QUESTION_NOT_PENDING = 'QUESTION_NOT_PENDING',
  INVALID_QUESTION_ANSWER = 'INVALID_QUESTION_ANSWER',
  API_KEY_NOT_CONFIGURED = 'API_KEY_NOT_CONFIGURED',
  USER_WORKSPACE_ID_NOT_FOUND = 'USER_WORKSPACE_ID_NOT_FOUND',
  ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
  ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS = 'ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS',
  NO_FAILED_TURN_TO_RETRY = 'NO_FAILED_TURN_TO_RETRY',
  STREAM_INTERRUPTED = 'STREAM_INTERRUPTED',
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
    case AiExceptionCode.WORKSPACE_NOT_FOUND:
      return msg`Workspace not found.`;
    case AiExceptionCode.CONTEXT_WINDOW_EXCEEDED:
      return msg`This conversation is too long for the model. Start a new thread to continue.`;
    case AiExceptionCode.INVALID_CHAT_THREAD_TITLE:
      return msg`Chat thread title cannot be empty.`;
    case AiExceptionCode.MESSAGE_NOT_FOUND:
      return msg`Chat message not found.`;
    case AiExceptionCode.QUESTION_NOT_PENDING:
      return msg`This question has already been answered.`;
    case AiExceptionCode.INVALID_QUESTION_ANSWER:
      return msg`Invalid answer for this question.`;
    case AiExceptionCode.API_KEY_NOT_CONFIGURED:
      return msg`API key is not configured.`;
    case AiExceptionCode.USER_WORKSPACE_ID_NOT_FOUND:
      return msg`User workspace not found.`;
    case AiExceptionCode.ROLE_NOT_FOUND:
      return msg`Role not found.`;
    case AiExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS:
      return msg`This role cannot be assigned to agents.`;
    case AiExceptionCode.NO_FAILED_TURN_TO_RETRY:
      return msg`There is no failed message to retry.`;
    case AiExceptionCode.STREAM_INTERRUPTED:
      return msg`The response was interrupted before it could finish.`;
    default:
      assertUnreachable(code);
  }
};

export class AiException extends CustomException<AiExceptionCode> {
  constructor(
    message: string,
    code: AiExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getAiExceptionUserFriendlyMessage(code),
    });
  }
}
