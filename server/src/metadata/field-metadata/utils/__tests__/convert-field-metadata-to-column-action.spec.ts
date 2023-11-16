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

  it('should convert URL field metadata to column actions', () => {
    const fieldMetadata = {
      type: FieldMetadataType.URL,
      targetColumnMap: { text: 'url_text', link: 'url_link' },
      defaultValue: { text: 'http://example.com', link: 'Example' },
    } as any;
    const columnActions = convertFieldMetadataToColumnActions(fieldMetadata);
    expect(columnActions).toEqual([
      {
        action: 'CREATE',
        columnName: 'url_text',
        columnType: 'varchar',
        defaultValue: "'http://example.com'",
      },
      {
        action: 'CREATE',
        columnName: 'url_link',
        columnType: 'varchar',
        defaultValue: "'Example'",
      },
    ]);
  });

  it('should convert MONEY field metadata to column actions', () => {
    const fieldMetadata = {
      type: FieldMetadataType.MONEY,
      targetColumnMap: { amount: 'money_amount', currency: 'money_currency' },
      defaultValue: { amount: 100, currency: 'USD' },
    } as any;
    const columnActions = convertFieldMetadataToColumnActions(fieldMetadata);
    expect(columnActions).toEqual([
      {
        action: 'CREATE',
        columnName: 'money_amount',
        columnType: 'integer',
        defaultValue: 100,
      },
      {
        action: 'CREATE',
        columnName: 'money_currency',
        columnType: 'varchar',
        defaultValue: "'USD'",
      },
    ]);
  });
});
