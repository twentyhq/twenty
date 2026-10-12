import { type ExtendedUIMessagePart } from '@/ai/types/ExtendedUIMessagePart';
import { getFillOpenFormToolResult } from '@/ai/utils/get-fill-open-form-tool-result.util';

const buildToolPart = (part: Record<string, unknown>) =>
  ({
    type: 'tool-fill_open_form',
    toolCallId: 'call-1',
    state: 'output-available',
    input: { values: { name: 'Domain required' } },
    output: {
      success: true,
      message: 'Filled',
      result: { formId: 'form-1', values: { name: 'Domain required' } },
    },
    ...part,
  }) as unknown as ExtendedUIMessagePart;

describe('getFillOpenFormToolResult', () => {
  it('should read the form and values of a finished fill', () => {
    expect(getFillOpenFormToolResult(buildToolPart({}))).toEqual({
      toolCallId: 'call-1',
      formId: 'form-1',
      values: { name: 'Domain required' },
    });
  });

  it.each([
    ['an unfinished fill', { state: 'input-available', output: undefined }],
    ['a failed fill', { output: { success: false, message: 'Failed' } }],
    ['another tool', { type: 'tool-create_validation_rule' }],
  ])('should ignore %s', (_label, part) => {
    expect(getFillOpenFormToolResult(buildToolPart(part))).toBeNull();
  });
});
