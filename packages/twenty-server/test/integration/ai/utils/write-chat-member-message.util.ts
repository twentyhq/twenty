import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AgentChatMemberMessagePartsService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-member-message-parts.service';
import { type AgentChatMemberMessageWriterService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-member-message-writer.service';
import { type AgentChatMemberMessage } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-member-message.type';

export const writeChatMemberMessage = async ({
  actor,
  message,
  ...writeInput
}: Omit<
  Parameters<AgentChatMemberMessageWriterService['writeMemberMessage']>[0],
  'message'
> & {
  message: AgentChatMemberMessage;
}) => {
  const preparedMessage =
    await getAppProviderByClassName<AgentChatMemberMessagePartsService>(
      'AgentChatMemberMessagePartsService',
    ).prepareMemberMessage({ workspaceId: actor.workspaceId, message });

  return getAppProviderByClassName<AgentChatMemberMessageWriterService>(
    'AgentChatMemberMessageWriterService',
  ).writeMemberMessage({ ...writeInput, actor, message: preparedMessage });
};
