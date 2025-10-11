import { FieldMetadataType } from 'twenty-shared/types';
import { type DeepPartial } from 'typeorm/common/DeepPartial';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

import { mapObjectMetadataByUniqueIdentifier } from './sync-metadata.util';

describe('mapObjectMetadataByUniqueIdentifier', () => {
  it('should convert an array of ObjectMetadataEntity objects into a map', () => {
    const arr: DeepPartial<ObjectMetadataEntity>[] = [
      {
        standardId: 'user',
        nameSingular: 'user',
        fields: [
          { name: 'id', type: FieldMetadataType.UUID },
          { name: 'name', type: FieldMetadataType.TEXT },
        ],
      },
      {
        standardId: 'product',
        nameSingular: 'product',
        fields: [
          { name: 'id', type: FieldMetadataType.UUID },
          { name: 'name', type: FieldMetadataType.TEXT },
          { name: 'price', type: FieldMetadataType.UUID },
        ],
      },
    ];

    const mappedObject = mapObjectMetadataByUniqueIdentifier(
      arr as ObjectMetadataEntity[],
    );

    expect(mappedObject).toEqual({
      user: {
        standardId: 'user',
        nameSingular: 'user',
        fields: [
          { name: 'id', type: FieldMetadataType.UUID },
          { name: 'name', type: FieldMetadataType.TEXT },
        ],
      },
      product: {
        standardId: 'product',
        nameSingular: 'product',
        fields: [
          { name: 'id', type: FieldMetadataType.UUID },
          { name: 'name', type: FieldMetadataType.TEXT },
          { name: 'price', type: FieldMetadataType.UUID },
        ],
      },
    });
  });

  it('should return an empty map if the input array is empty', () => {
    const arr: ObjectMetadataEntity[] = [];

    const mappedObject = mapObjectMetadataByUniqueIdentifier(arr);

    expect(mappedObject).toEqual({});
  });
});
