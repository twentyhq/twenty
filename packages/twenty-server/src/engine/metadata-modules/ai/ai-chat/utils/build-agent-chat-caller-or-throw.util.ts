import { ForbiddenException } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getScopedCallingApplication } from 'src/engine/core-modules/application/utils/get-scoped-calling-application.util';
import { type AgentChatCaller } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-caller.type';

export const buildAgentChatCallerOrThrow = ({
  workspaceMemberId,
  callingApplication,
}: {
  workspaceMemberId: string | undefined;
  callingApplication: FlatApplication | undefined;
}): AgentChatCaller => {
  if (isDefined(workspaceMemberId)) {
    return { type: 'member', workspaceMemberId };
  }

  const application = getScopedCallingApplication(callingApplication);

  if (!isDefined(application)) {
    throw new ForbiddenException(
      'This endpoint requires a workspace member or an application.',
    );
  }

  return { type: 'application', application };
};
