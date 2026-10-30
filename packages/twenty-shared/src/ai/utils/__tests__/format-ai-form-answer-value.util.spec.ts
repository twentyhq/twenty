import { formatAiFormAnswerValue } from '@/ai/utils/format-ai-form-answer-value.util';

const options = [
  { value: 'friendly', label: 'Friendly and concise' },
  { value: 'formal', label: 'Formal and direct' },
];

describe('formatAiFormAnswerValue', () => {
  it('shows inline choices by label', () => {
    expect(
      formatAiFormAnswerValue(
        { name: 'tone', label: 'Tone', type: 'SELECT', settings: { options } },
        'formal',
      ),
    ).toBe('Formal and direct');
    expect(
      formatAiFormAnswerValue(
        {
          name: 'tones',
          label: 'Tones',
          type: 'MULTI_SELECT',
          settings: { optionSource: 'inline', options },
        },
        ['friendly', 'formal'],
      ),
    ).toBe('Friendly and concise, Formal and direct');
  });

  it('keeps other values as before', () => {
    expect(
      formatAiFormAnswerValue({ name: 'n', label: 'N', type: 'TEXT' }, 'hi'),
    ).toBe('hi');
    expect(
      formatAiFormAnswerValue(
        {
          name: 'company',
          label: 'Company',
          type: 'RECORD',
          settings: { objectName: 'company' },
        },
        { id: 'record-id' },
      ),
    ).toBe('{"id":"record-id"}');
  });
});
