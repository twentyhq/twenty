import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { convertFieldMetadataToColumnActions } from 'src/metadata/field-metadata/utils/convert-field-metadata-to-column-action.util';

describe('convertFieldMetadataToColumnActions', () => {
  it('should convert TEXT field metadata to column actions', () => {
    const fieldMetadata = {
      type: FieldMetadataType.TEXT,
      targetColumnMap: { value: 'name' },
      defaultValue: { value: 'default text' },
    } as any;
    const columnActions = convertFieldMetadataToColumnActions(fieldMetadata);
    expect(columnActions).toEqual([
      {
        action: 'CREATE',
        columnName: 'name',
        columnType: 'text',
        defaultValue: "'default text'",
      },
    ]);
  });

  it('should convert LINK field metadata to column actions', () => {
    const fieldMetadata = {
      type: FieldMetadataType.LINK,
      targetColumnMap: { label: 'linkLabel', url: 'linkURL' },
      defaultValue: { label: 'http://example.com', url: 'Example' },
    } as any;
    const columnActions = convertFieldMetadataToColumnActions(fieldMetadata);
    expect(columnActions).toEqual([
      {
        action: 'CREATE',
        columnName: 'linkLabel',
        columnType: 'varchar',
        defaultValue: "'http://example.com'",
      },
      {
        action: 'CREATE',
        columnName: 'linkURL',
        columnType: 'varchar',
        defaultValue: "'Example'",
      },
    ]);
  });

  it('should convert CURRENCY field metadata to column actions', () => {
    const fieldMetadata = {
      type: FieldMetadataType.CURRENCY,
      targetColumnMap: {
        amountMicros: 'moneyAmountMicros',
        currencyCode: 'moneyCurrencyCode',
      },
      defaultValue: { amountMicros: 100 * 1_000_000, currencyCode: 'USD' },
    } as any;
    const columnActions = convertFieldMetadataToColumnActions(fieldMetadata);
    expect(columnActions).toEqual([
      {
        action: 'CREATE',
        columnName: 'moneyAmountMicros',
        columnType: 'integer',
        defaultValue: 100 * 1_000_000,
      },
      {
        action: 'CREATE',
        columnName: 'moneyCurrencyCode',
        columnType: 'varchar',
        defaultValue: "'USD'",
      },
    ]);
  });
});
