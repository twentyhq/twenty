import { FieldMetadataType } from '@/types/FieldMetadataType';
import { formatRecordExportHeader } from '@/utils/csv/formatRecordExportHeader';

describe('formatRecordExportHeader', () => {
  it('prepends a BOM and escapes labels once', () => {
    expect(
      formatRecordExportHeader([
        { fieldName: 'id', label: 'Id', type: FieldMetadataType.UUID },
        {
          fieldName: 'name',
          label: 'Name, "display"\n名前',
          type: FieldMetadataType.TEXT,
        },
      ]),
    ).toBe('\uFEFFId,"Name, ""display""\n名前"\n');
  });

  it('protects formula-like field labels', () => {
    expect(
      formatRecordExportHeader([
        { fieldName: 'name', label: '=SUM(1)', type: FieldMetadataType.TEXT },
      ]),
    ).toBe('\uFEFF\u200D=SUM(1)\n');
  });
});
