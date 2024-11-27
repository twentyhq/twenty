import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';

describe('getObjectMetadataMapItemByNameSingular', () => {
  it('should return the correct metadata item when given a valid singular name', () => {
    const mockMetadataItem = {
      id: 'test-id',
      nameSingular: 'company',
    } as ObjectMetadataItemWithFieldMaps;

    const mockObjectMetadataMaps: ObjectMetadataMaps = {
      byId: {
        'test-id': mockMetadataItem,
      },
      idByNameSingular: {
        company: 'test-id',
      },
    };

    const result = getObjectMetadataMapItemByNameSingular(
      mockObjectMetadataMaps,
      'company',
    );

    expect(result).toBe(mockMetadataItem);
  });

  it('should return undefined when the singular name does not exist', () => {
    const mockObjectMetadataMaps: ObjectMetadataMaps = {
      byId: {},
      idByNameSingular: {},
    };

    const result = getObjectMetadataMapItemByNameSingular(
      mockObjectMetadataMaps,
      'nonexistent',
    );

    expect(result).toBeUndefined();
  });
});
