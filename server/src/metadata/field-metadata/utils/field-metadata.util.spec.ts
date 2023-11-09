import { FieldMetadataType } from 'src/database/typeorm/metadata/entities/field-metadata.entity';

import {
  generateTargetColumnMap,
  convertFieldMetadataToColumnActions,
} from './field-metadata.util';

describe('generateTargetColumnMap', () => {
  it('should generate a target column map for a given type', () => {
    const textMap = generateTargetColumnMap(
      FieldMetadataType.TEXT,
      false,
      'name',
    );
    expect(textMap).toEqual({ value: 'name' });

    const urlMap = generateTargetColumnMap(
      FieldMetadataType.URL,
      false,
      'website',
    );
    expect(urlMap).toEqual({ text: 'website_text', link: 'website_link' });

    const moneyMap = generateTargetColumnMap(
      FieldMetadataType.MONEY,
      true,
      'price',
    );
    expect(moneyMap).toEqual({
      amount: '_price_amount',
      currency: '_price_currency',
    });
  });

  it('should throw an error for an unknown type', () => {
    expect(() =>
      generateTargetColumnMap('invalid' as FieldMetadataType, false, 'name'),
    ).toThrowError('Unknown type invalid');
  });
});

describe('convertFieldMetadataToColumnActions', () => {
  it('should convert field metadata to column actions', () => {
    const fieldMetadata = {
      type: FieldMetadataType.TEXT,
      targetColumnMap: { value: 'name' },
    } as any;
    const columnActions = convertFieldMetadataToColumnActions(fieldMetadata);
    expect(columnActions).toEqual([
      {
        action: 'CREATE',
        columnName: 'name',
        columnType: 'text',
      },
    ]);
  });
});
