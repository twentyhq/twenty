import { FieldMetadataType } from '@/types/FieldMetadataType';

import { type RecordExportColumn } from '@/types/RecordExportColumn';
import { buildRecordExportColumns } from '@/utils/csv/buildRecordExportColumns';
import { formatRecordExportRow } from '@/utils/csv/formatRecordExportRow';

describe('formatRecordExportRow', () => {
  const column = (
    fieldName: string,
    type = FieldMetadataType.TEXT,
    subFieldName?: string,
  ): RecordExportColumn => ({
    fieldName,
    label: fieldName,
    type,
    subFieldName,
  });

  it('escapes multiline text, quotes, arrays and JSON, while preserving empty cells', () => {
    expect(
      formatRecordExportRow({
        columns: [
          column('name'),
          column('tags', FieldMetadataType.MULTI_SELECT),
          column('json', FieldMetadataType.RAW_JSON),
          column('empty'),
        ],
        record: {
          name: 'Ada, "Lovelace"\nLondon',
          tags: ['A', 'B'],
          json: { key: 'value' },
          empty: null,
        },
      }),
    ).toBe(
      '"Ada, ""Lovelace""\nLondon","[""A"",""B""]","{""key"":""value""}",\n',
    );
  });

  it.each(['=SUM(1)', '+SUM(A1:A10)', '-cmd', '@cmd', '\tcmd', '\rcmd'])(
    'protects formula-like cell values: %j',
    (text) => {
      const escapedText = text.includes('\r')
        ? `"\u200D${text}"`
        : `\u200D${text}`;

      expect(
        formatRecordExportRow({ columns: [column('text')], record: { text } }),
      ).toBe(`${escapedText}\n`);
    },
  );

  it('preserves raw arrays, empty arrays, and file metadata as JSON cells', () => {
    expect(
      formatRecordExportRow({
        columns: [
          column('tags', FieldMetadataType.MULTI_SELECT),
          column('skills', FieldMetadataType.ARRAY),
          column('files', FieldMetadataType.FILES),
        ],
        record: {
          tags: [],
          skills: ['TypeScript', 'React'],
          files: [{ name: 'report.csv' }],
        },
      }),
    ).toBe('[],"[""TypeScript"",""React""]","[{""name"":""report.csv""}]"\n');
  });

  it('keeps composite columns aligned when the first record is empty and later keys are reordered', () => {
    const columns = buildRecordExportColumns([
      { name: 'name', label: 'Name', type: FieldMetadataType.FULL_NAME },
    ]);

    expect(
      formatRecordExportRow({ columns, record: { id: '1', name: null } }),
    ).toBe('1,,\n');
    expect(
      formatRecordExportRow({
        columns,
        record: {
          id: '2',
          name: {
            lastName: 'Lovelace',
            __typename: 'FullName',
            firstName: 'Ada',
          },
        },
      }),
    ).toBe('2,Ada,Lovelace\n');
  });

  it('protects formula strings including composite values without converting negative numbers to text', () => {
    expect(
      formatRecordExportRow({
        columns: [
          column('text'),
          column('name', FieldMetadataType.FULL_NAME, 'firstName'),
          column('number', FieldMetadataType.NUMBER),
        ],
        record: {
          text: '=SUM(1)',
          name: { firstName: '+cmd' },
          number: -12,
        },
      }),
    ).toBe('\u200D=SUM(1),\u200D+cmd,-12\n');
  });

  it('exports currency amounts and null composites consistently across batches', () => {
    const columns = [
      column('amount', FieldMetadataType.CURRENCY, 'amountMicros'),
      column('amount', FieldMetadataType.CURRENCY, 'currencyCode'),
    ];
    expect(formatRecordExportRow({ columns, record: { amount: null } })).toBe(
      ',\n',
    );
    expect(
      formatRecordExportRow({
        columns,
        record: {
          amount: { amountMicros: '-1234567', currencyCode: 'EUR' },
        },
      }),
    ).toBe('-1.234567,EUR\n');
  });

  it.each([
    [null, '\n'],
    [undefined, '\n'],
    [0, '0\n'],
    [1500000, '1.5\n'],
  ])(
    'exports currency amount %s without treating a missing amount as zero',
    (amountMicros, expected) => {
      expect(
        formatRecordExportRow({
          columns: [
            column('amount', FieldMetadataType.CURRENCY, 'amountMicros'),
          ],
          record: { amount: { amountMicros } },
        }),
      ).toBe(expected);
    },
  );

  it('preserves a JSON string as JSON rather than plain text', () => {
    expect(
      formatRecordExportRow({
        columns: [column('json', FieldMetadataType.RAW_JSON)],
        record: { json: 'hello' },
      }),
    ).toBe('"""hello"""\n');
  });
  it('serializes native database dates without introducing JSON quotes into CSV cells', () => {
    expect(
      formatRecordExportRow({
        columns: [
          column('createdAt', FieldMetadataType.DATE_TIME),
          column('birthday', FieldMetadataType.DATE),
          column('dateString', FieldMetadataType.DATE),
        ],
        record: {
          createdAt: new Date('2026-01-02T03:04:05.000Z'),
          birthday: new Date('2000-01-02T00:00:00.000Z'),
          dateString: '2000-01-02',
        },
      }),
    ).toBe('2026-01-02T03:04:05.000Z,2000-01-02,2000-01-02\n');
  });
});
