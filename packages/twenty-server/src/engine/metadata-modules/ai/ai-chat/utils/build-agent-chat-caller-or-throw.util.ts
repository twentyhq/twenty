import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getScopedCallingApplication } from 'src/engine/core-modules/application/utils/get-scoped-calling-application.util';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type AgentChatCaller } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-caller.type';

export const buildAgentChatCallerOrThrow = ({
  workspaceMemberId,
  callingApplication,
}: {
  workspaceMemberId: string | undefined;
  callingApplication:
    | Pick<FlatApplication, 'id' | 'defaultRoleId' | 'sourceType'>
    | undefined;
}): AgentChatCaller => {
  if (isDefined(workspaceMemberId)) {
    return { type: 'workspaceMember', workspaceMemberId };
  }

  const application = getScopedCallingApplication(callingApplication);

  if (!isDefined(application)) {
    throw new AuthException(
      'A workspace member or an application must make this request',
      AuthExceptionCode.FORBIDDEN_EXCEPTION,
    );
  }

  return { type: 'applicationWithoutUser', application };
};
