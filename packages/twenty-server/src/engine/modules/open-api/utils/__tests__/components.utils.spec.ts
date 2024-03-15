import { computeSchemaComponents } from 'src/engine/modules/open-api/utils/components.utils';
import { objectMetadataItem } from 'src/utils/utils-test/object-metadata-item';
import { ObjectMetadataEntity } from 'src/engine-metadata/object-metadata/object-metadata.entity';

describe('computeSchemaComponents', () => {
  it('should compute schema components', () => {
    expect(
      computeSchemaComponents([objectMetadataItem] as ObjectMetadataEntity[]),
    ).toEqual({
      ObjectName: {
        type: 'object',
        required: ['fieldNumber'],
        example: { fieldNumber: '' },
        properties: {
          fieldCurrency: {
            properties: {
              amountMicros: { type: 'string' },
              currencyCode: { type: 'string' },
            },
            type: 'object',
          },
          fieldLink: {
            properties: {
              label: { type: 'string' },
              url: { type: 'string' },
            },
            type: 'object',
          },
          fieldNumber: {
            type: 'number',
          },
          fieldString: {
            type: 'string',
          },
        },
      },
    });
  });
});
