import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

// Turns, messages, parts and reactions are only read through the chat API once the thread is reachable
export const AGENT_CHAT_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.agentChatThread.universalIdentifier,
  STANDARD_OBJECTS.agentChatThreadParticipant.universalIdentifier,
  STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier,
];
