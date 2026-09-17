import { type AgentChatThreadParticipantDisplayName } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';

// A thread with a single participant reads like a private chat, so the model
// only hears about participants once a second person is in the thread.
export const buildThreadParticipantsSection = (
  threadParticipants: AgentChatThreadParticipantDisplayName[],
): string => {
  if (threadParticipants.length < 2) {
    return '';
  }

  const names = threadParticipants
    .map((participant) => `- ${participant.displayName}`)
    .join('\n');

  return `
## Thread Participants

This thread is shared between several people. Each user message starts with a <message_author> tag naming who wrote it. Address people by name when it helps, and do not assume every message comes from the user described in User Context.

${names}`;
};
