import { type AgentChatInboxAction } from '@/ai/types/AgentChatInboxAction';
import { type AgentChatInboxState } from '@/ai/types/AgentChatInboxState';
import { isDefined } from '@/utils/validation/isDefined';

// What a chat without the member's row reads as
const DEFAULT_AGENT_CHAT_INBOX_STATE: AgentChatInboxState = {
  lastReadAt: null,
  archivedAt: null,
  snoozedUntil: null,
  isSubscribed: true,
};

// The server writes each action as one SQL upsert stamped by the database
// clock (AgentChatThreadParticipantService); this is the same change, for
// the optimistic copy apps show before the server answers
export const applyAgentChatInboxAction = ({
  participant,
  action,
  now,
  threadLastActivityAt = null,
  snoozedUntil = null,
}: {
  participant: Partial<AgentChatInboxState> | null | undefined;
  action: AgentChatInboxAction;
  now: Date;
  threadLastActivityAt?: string | null;
  snoozedUntil?: string | null;
}): AgentChatInboxState => {
  const state = { ...DEFAULT_AGENT_CHAT_INBOX_STATE, ...participant };

  switch (action) {
    // Read up to what the thread holds now, never back
    case 'READ':
      return {
        ...state,
        lastReadAt:
          isDefined(state.lastReadAt) &&
          (!isDefined(threadLastActivityAt) ||
            new Date(state.lastReadAt) > new Date(threadLastActivityAt))
            ? state.lastReadAt
            : threadLastActivityAt,
      };
    case 'UNREAD':
      return { ...state, lastReadAt: null };
    case 'ARCHIVE':
      return { ...state, archivedAt: now.toISOString(), snoozedUntil: null };
    // A snooze already due is saved as ended, and a snoozed chat is followed
    // again since it is meant to come back
    case 'SNOOZE':
      return {
        ...state,
        archivedAt:
          isDefined(snoozedUntil) && new Date(snoozedUntil) > now
            ? now.toISOString()
            : null,
        snoozedUntil,
        isSubscribed: true,
      };
    case 'MOVE_TO_INBOX':
      return {
        ...state,
        archivedAt: null,
        snoozedUntil: null,
        isSubscribed: true,
      };
    case 'SUBSCRIBE':
      return { ...state, isSubscribed: true };
    // Files the chat under done until the member is mentioned or writes in it
    case 'UNSUBSCRIBE':
      return {
        ...state,
        isSubscribed: false,
        archivedAt: now.toISOString(),
        snoozedUntil: null,
      };
  }
};
