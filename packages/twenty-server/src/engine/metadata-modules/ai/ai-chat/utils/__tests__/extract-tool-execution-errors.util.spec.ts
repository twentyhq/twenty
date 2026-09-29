import { type StepResult, type ToolSet } from 'ai';

import { extractToolExecutionErrors } from 'src/engine/metadata-modules/ai/ai-chat/utils/extract-tool-execution-errors.util';

type StepContent = StepResult<ToolSet>['content'];

describe('extractToolExecutionErrors', () => {
  it('should return errors thrown while a tool was running', () => {
    const toolError = {
      type: 'tool-error',
      toolCallId: 'search-call',
      toolName: 'search_help_center',
      input: { query: 'billing' },
      dynamic: true,
      error: new Error('Help center unreachable'),
    } as const;

    const content: StepContent = [
      {
        type: 'tool-call',
        toolCallId: 'search-call',
        toolName: 'search_help_center',
        input: { query: 'billing' },
        dynamic: true,
      },
      toolError,
    ];

    expect(extractToolExecutionErrors(content)).toEqual([toolError]);
  });

  it('should skip tool calls the model got wrong', () => {
    const content: StepContent = [
      {
        type: 'tool-call',
        toolCallId: 'unknown-tool-call',
        toolName: 'code_interpreter',
        input: {},
        dynamic: true,
        invalid: true,
        error: new Error('Model tried to call unavailable tool'),
      },
      {
        type: 'tool-error',
        toolCallId: 'unknown-tool-call',
        toolName: 'code_interpreter',
        input: {},
        dynamic: true,
        error: 'AI_NoSuchToolError: Model tried to call unavailable tool',
      },
    ];

    expect(extractToolExecutionErrors(content)).toEqual([]);
  });

  it('should skip errors from tools the provider runs itself', () => {
    const content: StepContent = [
      {
        type: 'tool-error',
        toolCallId: 'web-search-call',
        toolName: 'web_search',
        input: {},
        dynamic: true,
        providerExecuted: true,
        error: 'Search quota exceeded',
      },
    ];

    expect(extractToolExecutionErrors(content)).toEqual([]);
  });
});
