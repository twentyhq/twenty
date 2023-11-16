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
      FieldMetadataType.LINK,
      false,
      'website',
    );
    expect(urlMap).toEqual({ text: 'websiteLabel', link: 'websiteUrl' });

    const moneyMap = generateTargetColumnMap(
      FieldMetadataType.CURRENCY,
      true,
      'price',
    );
    expect(moneyMap).toEqual({
      amount: '_priceAmountMicros',
      currency: '_priceCurrencyCode',
    });
  });

  it('should throw an error for an unknown type', () => {
    expect(() =>
      generateTargetColumnMap('invalid' as FieldMetadataType, false, 'name'),
    ).toThrow(BadRequestException);
  });
});
