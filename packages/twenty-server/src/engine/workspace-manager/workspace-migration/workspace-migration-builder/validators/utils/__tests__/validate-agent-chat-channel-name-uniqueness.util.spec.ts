import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { validateAgentChatChannelNameUniqueness } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-agent-chat-channel-name-uniqueness.util';

const existingFlatAgentChatChannels = [
  { name: 'General' },
  { name: 'QA Claude renamed' },
];

describe('validateAgentChatChannelNameUniqueness', () => {
  it('should return no error for a new name', () => {
    expect(
      validateAgentChatChannelNameUniqueness({
        name: 'Sales',
        existingFlatAgentChatChannels,
      }),
    ).toEqual([]);
  });

  it('should return an error for an existing name', () => {
    const errors = validateAgentChatChannelNameUniqueness({
      name: 'General',
      existingFlatAgentChatChannels,
    });

    expect(errors.map(({ code }) => code)).toEqual([
      AiExceptionCode.INVALID_CHAT_CHANNEL_NAME,
    ]);
  });

  it('should return an error for a name that only differs by case', () => {
    const errors = validateAgentChatChannelNameUniqueness({
      name: 'qa claude renamed',
      existingFlatAgentChatChannels,
    });

    expect(errors.map(({ code }) => code)).toEqual([
      AiExceptionCode.INVALID_CHAT_CHANNEL_NAME,
    ]);
  });
});
