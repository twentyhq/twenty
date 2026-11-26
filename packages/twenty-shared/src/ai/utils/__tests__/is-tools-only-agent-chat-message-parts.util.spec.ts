/** @jest-environment node */
import { type ExtendedUIMessagePart } from '@/ai/types/ExtendedUIMessagePart';
import { isToolsOnlyAgentChatMessageParts } from '@/ai/utils/is-tools-only-agent-chat-message-parts.util';

const createCompanyPart: ExtendedUIMessagePart = {
  type: 'tool-create_company',
  toolCallId: 'create-company-call',
  state: 'output-available',
  input: {},
  output: { success: true },
};

const failedReactionPart: ExtendedUIMessagePart = {
  type: 'tool-react_to_message',
  toolCallId: 'react-call',
  state: 'output-error',
  input: {},
  errorText: 'Failed',
};

const runningCreateCompanyPart: ExtendedUIMessagePart = {
  type: 'tool-create_company',
  toolCallId: 'create-company-call',
  state: 'input-available',
  input: {},
};

const pendingQuestionPart: ExtendedUIMessagePart = {
  type: 'tool-ask_question',
  toolCallId: 'ask-question-call',
  state: 'input-available',
  input: {},
};

const noReplyPart: ExtendedUIMessagePart = {
  type: 'tool-no_reply',
  toolCallId: 'no-reply-call',
  state: 'output-available',
  input: {},
  output: { success: true },
};

describe('isToolsOnlyAgentChatMessageParts', () => {
  it('accepts a turn that thought and ran tools without writing', () => {
    expect(
      isToolsOnlyAgentChatMessageParts([
        { type: 'step-start' },
        { type: 'reasoning', text: 'Creating the company' },
        createCompanyPart,
        failedReactionPart,
        { type: 'text', text: '  ' },
      ]),
    ).toBe(true);
  });

  it('rejects a turn that wrote a reply', () => {
    expect(
      isToolsOnlyAgentChatMessageParts([
        createCompanyPart,
        { type: 'text', text: 'Done.' },
      ]),
    ).toBe(false);
  });

  it('rejects a turn whose tools have not finished', () => {
    expect(isToolsOnlyAgentChatMessageParts([runningCreateCompanyPart])).toBe(
      false,
    );
  });

  it('rejects a turn that asks the member something', () => {
    expect(
      isToolsOnlyAgentChatMessageParts([
        createCompanyPart,
        pendingQuestionPart,
      ]),
    ).toBe(false);
  });

  it('leaves no_reply turns to the silent check', () => {
    expect(isToolsOnlyAgentChatMessageParts([noReplyPart])).toBe(false);
  });
});
