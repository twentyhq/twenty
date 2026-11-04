import { AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH } from '@/ai/constants/ai-chat-assistant-display-name-max-length.const';
import { DEFAULT_AI_CHAT_ASSISTANT_PROFILE } from '@/ai/constants/default-ai-chat-assistant-profile.const';
import { getAiChatAssistantProfileSchema } from '@/ai/schemas/get-ai-chat-assistant-profile-schema';

describe('getAiChatAssistantProfileSchema', () => {
  it('accepts the complete Ada reset configuration', () => {
    expect(
      getAiChatAssistantProfileSchema().parse(
        DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
      ),
    ).toEqual(DEFAULT_AI_CHAT_ASSISTANT_PROFILE);
  });

  it('trims a bounded display name without supplying omitted update fields', () => {
    expect(
      getAiChatAssistantProfileSchema().partial().parse({
        aiChatAssistantDisplayName: '  Nimbus  ',
      }),
    ).toEqual({ aiChatAssistantDisplayName: 'Nimbus' });
  });

  it.each([
    { aiChatAssistantDisplayName: null },
    { aiChatAssistantDisplayName: '  ' },
    {
      aiChatAssistantDisplayName: 'A'.repeat(
        AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH + 1,
      ),
    },
    { aiChatAssistantAvatarShape: 'square' },
    { aiChatAssistantAvatarColor: 'violet' },
    { aiChatAssistantAvatarFace: 'angry' },
    { isAiChatAssistantAvatarAnimated: 'true' },
  ])('rejects an invalid update %j', (update) => {
    expect(
      getAiChatAssistantProfileSchema().partial().safeParse(update).success,
    ).toBe(false);
  });
});
