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

  it('accepts and trims a display name at the maximum length', () => {
    const displayName = 'A'.repeat(AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH);

    expect(
      getAiChatAssistantProfileSchema()
        .partial()
        .parse({
          aiChatAssistantDisplayName: `  ${displayName}  `,
        }),
    ).toEqual({ aiChatAssistantDisplayName: displayName });
  });

  it('preserves omitted fields and an explicit false animation update', () => {
    expect(getAiChatAssistantProfileSchema().partial().parse({})).toEqual({});
    expect(
      getAiChatAssistantProfileSchema().partial().parse({
        isAiChatAssistantAvatarAnimated: false,
      }),
    ).toEqual({ isAiChatAssistantAvatarAnimated: false });
  });

  it.each([
    { aiChatAssistantDisplayName: null },
    { aiChatAssistantDisplayName: '  ' },
    {
      aiChatAssistantDisplayName: 'A'.repeat(
        AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH + 1,
      ),
    },
    { aiChatAssistantDisplayName: 42 },
    { aiChatAssistantAvatarShape: null },
    { aiChatAssistantAvatarShape: 'square' },
    { aiChatAssistantAvatarColor: null },
    { aiChatAssistantAvatarColor: 'violet' },
    { aiChatAssistantAvatarFace: null },
    { aiChatAssistantAvatarFace: 'angry' },
    { isAiChatAssistantAvatarAnimated: null },
    { isAiChatAssistantAvatarAnimated: 'true' },
  ])('rejects an invalid update %j', (update) => {
    expect(
      getAiChatAssistantProfileSchema().partial().safeParse(update).success,
    ).toBe(false);
  });
});
