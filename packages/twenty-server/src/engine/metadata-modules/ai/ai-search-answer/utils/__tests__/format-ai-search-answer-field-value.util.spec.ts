import { FieldMetadataType } from 'twenty-shared/types';

import { formatAiSearchAnswerFieldValue } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/format-ai-search-answer-field-value.util';

const format = (
  type: FieldMetadataType,
  value: unknown,
  options: Array<{ value: string; label: string }> | null = null,
) =>
  formatAiSearchAnswerFieldValue({
    field: {
      type,
      options: options as Parameters<
        typeof formatAiSearchAnswerFieldValue
      >[0]['field']['options'],
    },
    value,
  });

describe('formatAiSearchAnswerFieldValue', () => {
  it('formats composite values as readable text', () => {
    expect(
      format(FieldMetadataType.CURRENCY, {
        amountMicros: 1_500_000_000,
        currencyCode: 'EUR',
      }),
    ).toBe('1500 EUR');
    expect(
      format(FieldMetadataType.FULL_NAME, { firstName: 'Jane', lastName: '' }),
    ).toBe('Jane');
    expect(
      format(FieldMetadataType.EMAILS, {
        primaryEmail: 'jane@acme.com',
        additionalEmails: ['j.doe@acme.com'],
      }),
    ).toBe('jane@acme.com, j.doe@acme.com');
    expect(
      format(FieldMetadataType.LINKS, {
        primaryLinkUrl: 'acme.com',
        secondaryLinks: [{ url: 'blog.acme.com' }],
      }),
    ).toBe('acme.com, blog.acme.com');
    expect(
      format(FieldMetadataType.ADDRESS, {
        addressCity: 'Paris',
        addressCountry: 'France',
      }),
    ).toBe('Paris, France');
    expect(
      format(FieldMetadataType.RICH_TEXT, {
        markdown: '# Notes',
        blocknote: '[{"type":"heading"}]',
      }),
    ).toBe('# Notes');
  });

  it('uses option labels for select values', () => {
    const options = [{ value: 'CUSTOMER', label: 'Customer' }];

    expect(format(FieldMetadataType.SELECT, 'CUSTOMER', options)).toBe(
      'Customer',
    );
    expect(
      format(FieldMetadataType.MULTI_SELECT, ['CUSTOMER', 'UNKNOWN'], options),
    ).toBe('Customer, UNKNOWN');
  });

  it('returns null for empty values and unsupported types', () => {
    expect(format(FieldMetadataType.TEXT, '')).toBeNull();
    expect(format(FieldMetadataType.TEXT, null)).toBeNull();
    expect(
      format(FieldMetadataType.CURRENCY, {
        amountMicros: null,
        currencyCode: 'EUR',
      }),
    ).toBeNull();
    expect(format(FieldMetadataType.RAW_JSON, { secret: 'value' })).toBeNull();
  });
});
