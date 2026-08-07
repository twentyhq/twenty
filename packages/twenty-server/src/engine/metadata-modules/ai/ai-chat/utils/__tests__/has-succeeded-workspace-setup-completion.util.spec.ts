import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { hasSucceededWorkspaceSetupCompletion } from 'src/engine/metadata-modules/ai/ai-chat/utils/has-succeeded-workspace-setup-completion.util';

const buildMessage = (parts: unknown[]): ExtendedUIMessage =>
  ({
    id: 'message-1',
    role: 'assistant',
    parts,
  }) as ExtendedUIMessage;

describe('hasSucceededWorkspaceSetupCompletion', () => {
  it('should detect a succeeded completion in an earlier message', () => {
    const messages = [
      buildMessage([{ type: 'text', text: 'All set.' }]),
      buildMessage([
        {
          type: 'tool-complete_workspace_setup',
          toolCallId: 'call-1',
          input: {},
          state: 'output-available',
          output: { success: true, message: 'Setup marked as finished.' },
        },
      ]),
    ];

    expect(hasSucceededWorkspaceSetupCompletion(messages)).toBe(true);
  });

  it('should ignore a completion that has not produced its output yet', () => {
    const messages = [
      buildMessage([
        {
          type: 'tool-complete_workspace_setup',
          toolCallId: 'call-1',
          input: {},
          state: 'input-streaming',
        },
      ]),
    ];

    expect(hasSucceededWorkspaceSetupCompletion(messages)).toBe(false);
  });

  it('should ignore a completion that failed', () => {
    const messages = [
      buildMessage([
        {
          type: 'tool-complete_workspace_setup',
          toolCallId: 'call-1',
          input: {},
          state: 'output-available',
          output: { success: false, message: 'Something went wrong.' },
        },
      ]),
    ];

    expect(hasSucceededWorkspaceSetupCompletion(messages)).toBe(false);
  });

  it('should ignore other tools that succeeded', () => {
    const messages = [
      buildMessage([
        {
          type: 'tool-ask_questions',
          toolCallId: 'call-1',
          input: {},
          state: 'output-available',
          output: { success: true },
        },
      ]),
    ];

    expect(hasSucceededWorkspaceSetupCompletion(messages)).toBe(false);
  });

  it('should return false for a conversation without any tool call', () => {
    expect(
      hasSucceededWorkspaceSetupCompletion([
        buildMessage([{ type: 'text', text: 'Hello.' }]),
      ]),
    ).toBe(false);
  });
});
