import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

import {
  filterIgnoredProperties,
  mapObjectMetadataByUniqueIdentifier,
} from './sync-metadata.util';

describe('filterIgnoredProperties', () => {
  it('should filter out properties based on the ignore list', () => {
    const obj = {
      name: 'John',
      age: 30,
      email: 'john@example.com',
      address: '123 Main St',
    };
    const propertiesToIgnore = ['age', 'address'];

    const filteredObj = filterIgnoredProperties(obj, propertiesToIgnore);

    expect(filteredObj).toEqual({
      name: 'John',
      email: 'john@example.com',
    });
  });

  it('should return the original object if ignore list is empty', () => {
    const obj = {
      name: 'John',
      age: 30,
      email: 'john@example.com',
      address: '123 Main St',
    };
    const propertiesToIgnore: string[] = [];

    const filteredObj = filterIgnoredProperties(obj, propertiesToIgnore);

    expect(filteredObj).toEqual(obj);
  });

  it('should return an empty object if the original object is empty', () => {
    const obj = {};
    const propertiesToIgnore = ['age', 'address'];

    const filteredObj = filterIgnoredProperties(obj, propertiesToIgnore);

    expect(filteredObj).toEqual({});
  });
});

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
        fields: {
          id: { name: 'id', type: FieldMetadataType.UUID },
          name: { name: 'name', type: FieldMetadataType.TEXT },
        },
      },
      product: {
        nameSingular: 'product',
        fields: {
          id: { name: 'id', type: FieldMetadataType.UUID },
          name: { name: 'name', type: FieldMetadataType.TEXT },
          price: { name: 'price', type: FieldMetadataType.UUID },
        },
      },
    });
  });

  it('should return an empty map if the input array is empty', () => {
    const arr: ObjectMetadataEntity[] = [];

    const mappedObject = mapObjectMetadataByUniqueIdentifier(arr);

    expect(mappedObject).toEqual({});
  });
});
