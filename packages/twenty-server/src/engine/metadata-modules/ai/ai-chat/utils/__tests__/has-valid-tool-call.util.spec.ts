import { type StepResult, type ToolSet } from 'ai';
import { ASK_QUESTIONS_TOOL_NAME } from 'twenty-shared/ai';

import { hasValidToolCall } from 'src/engine/metadata-modules/ai/ai-chat/utils/has-valid-tool-call.util';

const buildSteps = (toolCalls: StepResult<ToolSet>['toolCalls']) =>
  [{ toolCalls }] as StepResult<ToolSet>[];

describe('hasValidToolCall', () => {
  it('should stop on a valid call to a watched tool', () => {
    expect(
      hasValidToolCall(ASK_QUESTIONS_TOOL_NAME)({
        steps: buildSteps([
          {
            type: 'tool-call',
            toolCallId: 'question-call',
            toolName: ASK_QUESTIONS_TOOL_NAME,
            input: {},
            dynamic: true,
          },
        ]),
      }),
    ).toBe(true);
  });

  it('should keep going when the call is invalid so the model can retry it', () => {
    expect(
      hasValidToolCall(ASK_QUESTIONS_TOOL_NAME)({
        steps: buildSteps([
          {
            type: 'tool-call',
            toolCallId: 'question-call',
            toolName: ASK_QUESTIONS_TOOL_NAME,
            input: {},
            dynamic: true,
            invalid: true,
            error: new Error('Invalid input for tool ask_questions'),
          },
        ]),
      }),
    ).toBe(false);
  });
});
