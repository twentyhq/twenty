import { BadRequestException } from '@nestjs/common';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { generateTargetColumnMap } from 'src/engine/metadata-modules/field-metadata/utils/generate-target-column-map.util';

describe('generateTargetColumnMap', () => {
  it('should generate a target column map for a given type', () => {
    const textMap = generateTargetColumnMap(
      FieldMetadataType.TEXT,
      false,
      'name',
    );

    expect(textMap).toEqual({ value: 'name' });

    const linkMap = generateTargetColumnMap(
      FieldMetadataType.LINK,
      false,
      'website',
    );

    expect(linkMap).toEqual({ label: 'websiteLabel', url: 'websiteUrl' });

    const currencyMap = generateTargetColumnMap(
      FieldMetadataType.CURRENCY,
      true,
      'price',
    );

    expect(currencyMap).toEqual({
      amountMicros: '_priceAmountMicros',
      currencyCode: '_priceCurrencyCode',
    });
  });

  it('should throw an error for an unknown type', () => {
    expect(() =>
      generateTargetColumnMap('invalid' as FieldMetadataType, false, 'name'),
    ).toThrow(BadRequestException);
  });
});
