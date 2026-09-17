import { isNonEmptyString } from '@sniptt/guards';

import { type AgentChatThreadSharingContext } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';

// A private thread reads like a one-to-one chat, so the model only hears
// about other people once the thread is shared or lives in a channel.
export const buildThreadParticipantsSection = (
  sharingContext: AgentChatThreadSharingContext | undefined,
): string => {
  if (!isDefinedSharedContext(sharingContext)) {
    return '';
  }

  const lines = [
    'This thread is shared between several people. Each user message starts with a <message_author> tag naming who wrote it. Address people by name when it helps, and do not assume every message comes from the user described in User Context.',
  ];

  if (isNonEmptyString(sharingContext.channelName)) {
    lines.push(
      `The thread lives in the "${sharingContext.channelName}" channel; every member of that channel can read it and write in it.`,
    );
  }

  if (sharingContext.participantNames.length > 0) {
    lines.push(
      'Participants:',
      ...sharingContext.participantNames.map((name) => `- ${name}`),
    );
  }

  return `
## Thread Participants

${lines.join('\n')}`;
};

const isDefinedSharedContext = (
  sharingContext: AgentChatThreadSharingContext | undefined,
): sharingContext is AgentChatThreadSharingContext =>
  sharingContext?.isShared === true;
