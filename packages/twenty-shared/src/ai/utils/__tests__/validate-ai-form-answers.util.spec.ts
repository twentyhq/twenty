import { type RequestFormField } from '@/ai/types/RequestFormToolInput';
import { validateAiFormAnswers } from '@/ai/utils/validate-ai-form-answers.util';

const fields: RequestFormField[] = [
  {
    name: 'tone',
    label: 'Message style',
    type: 'SELECT',
    settings: {
      optionSource: 'inline',
      options: [
        { value: 'friendly', label: 'Friendly' },
        { value: 'formal', label: 'Formal' },
      ],
      required: true,
    },
  },
  {
    name: 'topics',
    label: 'Topics',
    type: 'MULTI_SELECT',
    settings: {
      optionSource: 'inline',
      options: [
        { value: 'pricing', label: 'Pricing' },
        { value: 'timeline', label: 'Timeline' },
      ],
    },
  },
  { name: 'seats', label: 'Seats', type: 'NUMBER' },
  { name: 'meetingDate', label: 'Meeting date', type: 'DATE' },
  {
    name: 'company',
    label: 'Company',
    type: 'RECORD',
    settings: { objectName: 'company' },
  },
  {
    name: 'stage',
    label: 'Stage',
    type: 'SELECT',
    settings: { selectedFieldId: 'field-id' },
  },
];

describe('validateAiFormAnswers', () => {
  it('accepts well-formed answers', () => {
    expect(
      validateAiFormAnswers({
        fields,
        values: {
          tone: 'formal',
          topics: ['pricing'],
          seats: 12,
          meetingDate: '2026-11-04',
          company: { id: '1a000000-0000-4000-8000-000000000001' },
          stage: 'PROPOSAL',
        },
      }),
    ).toEqual([]);
  });

  it('keeps legacy optional semantics when required is absent', () => {
    expect(
      validateAiFormAnswers({ fields, values: { tone: 'friendly' } }),
    ).toEqual([]);
  });

  it('rejects missing required, unknown fields and invalid values', () => {
    expect(
      validateAiFormAnswers({
        fields,
        values: {
          unknown: 'x',
          topics: ['pricing', 'pricing'],
          seats: Number.POSITIVE_INFINITY,
          meetingDate: '04/11/2026',
          company: { id: 'not-a-uuid' },
        },
      }),
    ).toEqual([
      'The form has no field named unknown.',
      'Message style is required.',
      'Topics lists an option more than once.',
      'Seats must be a number.',
      'Meeting date must be a valid date.',
      'Company must be a record picked from the list.',
    ]);
  });

  it('rejects a choice that is not offered', () => {
    expect(
      validateAiFormAnswers({
        fields,
        values: { tone: 'casual', topics: ['budget'] },
      }),
    ).toEqual([
      'Message style must be one of its options.',
      'Topics must only list its options.',
    ]);
  });
});
