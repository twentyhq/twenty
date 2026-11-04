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
          displayName: `  ${displayName}  `,
        }),
    ).toEqual({ displayName });
  });

  it('preserves omitted fields and an explicit false animation update', () => {
    expect(getAiChatAssistantProfileSchema().partial().parse({})).toEqual({});
    expect(
      getAiChatAssistantProfileSchema().partial().parse({
        isAvatarAnimated: false,
      }),
    ).toEqual({ isAvatarAnimated: false });
  });

  it.each([
    { displayName: null },
    { displayName: '  ' },
    {
      displayName: 'A'.repeat(AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH + 1),
    },
    { displayName: 42 },
    { avatarShape: null },
    { avatarShape: 'square' },
    { avatarColor: null },
    { avatarColor: 'violet' },
    { avatarFace: null },
    { avatarFace: 'angry' },
    { isAvatarAnimated: null },
    { isAvatarAnimated: 'true' },
  ])('rejects an invalid update %j', (update) => {
    expect(
      getAiChatAssistantProfileSchema().partial().safeParse(update).success,
    ).toBe(false);
  });
});
