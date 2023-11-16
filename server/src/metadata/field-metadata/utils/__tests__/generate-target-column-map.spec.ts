import { BadRequestException } from '@nestjs/common';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { generateTargetColumnMap } from 'src/metadata/field-metadata/utils/generate-target-column-map.util';

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
    ).toThrow(BadRequestException);
  });
});
