import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { hasNoAssistantMessage } from 'src/engine/metadata-modules/ai/ai-chat/utils/has-no-assistant-message.util';

const message = (
  role: 'user' | 'assistant',
): Pick<ExtendedUIMessage, 'role'> => ({ role });

describe('hasNoAssistantMessage', () => {
  it('should return true when only user messages exist', () => {
    expect(hasNoAssistantMessage([message('user')])).toBe(true);
  });

  it('should return true for an empty conversation', () => {
    expect(hasNoAssistantMessage([])).toBe(true);
  });

  it('should return false once an assistant message exists', () => {
    expect(hasNoAssistantMessage([message('user'), message('assistant')])).toBe(
      false,
    );
  });
});
