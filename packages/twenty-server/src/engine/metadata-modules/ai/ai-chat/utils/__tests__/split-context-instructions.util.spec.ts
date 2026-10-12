import { type ModelMessage } from 'ai';

import { OPENING_PLACEHOLDER_USER_MESSAGE } from 'src/engine/metadata-modules/ai/ai-chat/constants/opening-placeholder-user-message.constant';
import { splitContextInstructions } from 'src/engine/metadata-modules/ai/ai-chat/utils/split-context-instructions.util';

const CONTEXT: ModelMessage = { role: 'system', content: 'Company: Acme' };
const USER_MESSAGE: ModelMessage = { role: 'user', content: 'Hello' };
const ASSISTANT_MESSAGE: ModelMessage = {
  role: 'assistant',
  content: 'A message from the application',
};

describe('splitContextInstructions', () => {
  it('moves contexts out of the conversation', () => {
    expect(splitContextInstructions([CONTEXT, USER_MESSAGE])).toEqual({
      contexts: [CONTEXT],
      conversation: [USER_MESSAGE],
    });
  });

  it('opens a conversation the agent started with a placeholder user message', () => {
    expect(splitContextInstructions([CONTEXT])).toEqual({
      contexts: [CONTEXT],
      conversation: [OPENING_PLACEHOLDER_USER_MESSAGE],
    });
    expect(
      splitContextInstructions([CONTEXT, ASSISTANT_MESSAGE, USER_MESSAGE]),
    ).toEqual({
      contexts: [CONTEXT],
      conversation: [
        OPENING_PLACEHOLDER_USER_MESSAGE,
        ASSISTANT_MESSAGE,
        USER_MESSAGE,
      ],
    });
  });

  it('leaves a conversation the user started as it is', () => {
    expect(splitContextInstructions([USER_MESSAGE, ASSISTANT_MESSAGE])).toEqual(
      {
        contexts: [],
        conversation: [USER_MESSAGE, ASSISTANT_MESSAGE],
      },
    );
  });
});
