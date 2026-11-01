import { formatRecordExportHeader } from '@/utils/csv/formatRecordExportHeader';

describe('formatRecordExportHeader', () => {
  it('prepends a BOM and escapes labels once', () => {
    expect(
      formatRecordExportHeader([
        { label: 'Id' },
        {
          label: 'Name, "display"\n名前',
        },
      ]),
    ).toBe('\uFEFFId,"Name, ""display""\n名前"\n');
  });

  it('protects formula-like field labels', () => {
    expect(formatRecordExportHeader([{ label: '=SUM(1)' }])).toBe(
      '\uFEFF\u200D=SUM(1)\n',
    );
  });
});
