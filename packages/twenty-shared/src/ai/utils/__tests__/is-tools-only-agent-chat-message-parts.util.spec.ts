/** @jest-environment node */
import { type ExtendedUIMessagePart } from '@/ai/types/ExtendedUIMessagePart';
import { isToolsOnlyAgentChatMessageParts } from '@/ai/utils/is-tools-only-agent-chat-message-parts.util';

const toolPart = (
  toolName: string,
  state: 'input-available' | 'output-available' | 'output-error',
) =>
  ({
    type: `tool-${toolName}`,
    toolCallId: `${toolName}-call`,
    state,
    input: {},
    ...(state === 'output-available' ? { output: { success: true } } : {}),
    ...(state === 'output-error' ? { errorText: 'Failed' } : {}),
  }) as ExtendedUIMessagePart;

describe('isToolsOnlyAgentChatMessageParts', () => {
  it('accepts a turn that thought and ran tools without writing', () => {
    expect(
      isToolsOnlyAgentChatMessageParts([
        { type: 'step-start' },
        { type: 'reasoning', text: 'Creating the company' },
        toolPart('create_company', 'output-available'),
        toolPart('react_to_message', 'output-error'),
        { type: 'text', text: '  ' },
      ] as ExtendedUIMessagePart[]),
    ).toBe(true);
  });

  it('rejects a turn that wrote a reply', () => {
    expect(
      isToolsOnlyAgentChatMessageParts([
        toolPart('create_company', 'output-available'),
        { type: 'text', text: 'Done.' },
      ] as ExtendedUIMessagePart[]),
    ).toBe(false);
  });

  it('rejects a turn whose tools have not finished', () => {
    expect(
      isToolsOnlyAgentChatMessageParts([
        toolPart('create_company', 'input-available'),
      ]),
    ).toBe(false);
  });

  it('rejects a turn that asks the member something', () => {
    expect(
      isToolsOnlyAgentChatMessageParts([
        toolPart('create_company', 'output-available'),
        toolPart('ask_question', 'input-available'),
      ]),
    ).toBe(false);
  });

  it('leaves no_reply turns to the silent check', () => {
    expect(
      isToolsOnlyAgentChatMessageParts([
        toolPart('no_reply', 'output-available'),
      ]),
    ).toBe(false);
  });
});
