import { isDefined } from 'twenty-shared/utils';

import { type AgentConversationActor } from 'src/engine/metadata-modules/ai/ai-history/types/agent-conversation-actor.type';

export const buildAgentConversationActor = ({
  workspaceMemberId,
  applicationId,
}: {
  workspaceMemberId: string | null | undefined;
  applicationId: string;
}): AgentConversationActor =>
  isDefined(workspaceMemberId)
    ? { type: 'user', workspaceMemberId }
    : { type: 'application', applicationId };
