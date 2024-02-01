import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

import { mapObjectMetadataByUniqueIdentifier } from './sync-metadata.util';

describe('mapObjectMetadataByUniqueIdentifier', () => {
  it('should convert an array of ObjectMetadataEntity objects into a map', () => {
    const arr: DeepPartial<ObjectMetadataEntity>[] = [
      {
        nameSingular: 'user',
        fields: [
          { name: 'id', type: FieldMetadataType.UUID },
          { name: 'name', type: FieldMetadataType.TEXT },
        ],
      },
      {
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
        nameSingular: 'user',
        fields: [
          { name: 'id', type: FieldMetadataType.UUID },
          { name: 'name', type: FieldMetadataType.TEXT },
        ],
      },
      product: {
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
