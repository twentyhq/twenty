import { validateAiFormFields } from '@/ai/utils/validate-ai-form-fields.util';

const inlineToneField = {
  name: 'tone',
  label: 'Message style',
  type: 'SELECT' as const,
  settings: {
    optionSource: 'inline',
    options: [
      { value: 'friendly', label: 'Friendly and concise' },
      { value: 'formal', label: 'Formal and direct' },
    ],
    required: true,
  },
};

describe('validateAiFormFields', () => {
  it('accepts inline choices and metadata-backed fields', () => {
    expect(
      validateAiFormFields([
        inlineToneField,
        {
          name: 'stage',
          label: 'Stage',
          type: 'SELECT',
          settings: { selectedFieldId: 'field-id' },
        },
        {
          name: 'company',
          label: 'Company',
          type: 'RECORD',
          settings: { objectName: 'company' },
        },
        { name: 'note', label: 'Note', type: 'TEXT' },
      ]),
    ).toEqual([]);
  });

  it('treats listed options without optionSource as inline choices', () => {
    expect(
      validateAiFormFields([
        {
          name: 'tone',
          label: 'Tone',
          type: 'SELECT',
          settings: {
            required: true,
            options: [
              { value: 'friendly', label: 'Friendly and concise' },
              { value: 'formal', label: 'Formal and direct' },
            ],
          },
        },
      ]),
    ).toEqual([]);
  });

  it('rejects inline choices combined with a metadata select field', () => {
    expect(
      validateAiFormFields([
        {
          ...inlineToneField,
          settings: { ...inlineToneField.settings, selectedFieldId: 'id' },
        },
      ]),
    ).toHaveLength(1);
  });

  it('rejects duplicate values, too many options and non-select types', () => {
    const duplicate = {
      ...inlineToneField,
      settings: {
        optionSource: 'inline',
        options: [
          { value: 'a', label: 'A' },
          { value: 'a', label: 'Also A' },
        ],
      },
    };
    const tooMany = {
      ...inlineToneField,
      settings: {
        optionSource: 'inline',
        options: Array.from({ length: 21 }, (_, index) => ({
          value: `v${index}`,
          label: `Option ${index}`,
        })),
      },
    };
    const textWithOptions = {
      ...inlineToneField,
      type: 'TEXT' as const,
    };

    expect(validateAiFormFields([duplicate])).toHaveLength(1);
    expect(validateAiFormFields([tooMany])).toHaveLength(1);
    expect(validateAiFormFields([textWithOptions])).toHaveLength(1);
  });

  it('requires the settings a select or record field cannot render without', () => {
    expect(
      validateAiFormFields([
        { name: 'stage', label: 'Stage', type: 'SELECT' },
        { name: 'company', label: 'Company', type: 'RECORD' },
      ]),
    ).toHaveLength(2);
  });
});
