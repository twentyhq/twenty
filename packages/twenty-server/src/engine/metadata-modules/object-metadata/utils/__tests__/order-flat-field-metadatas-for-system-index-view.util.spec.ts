import { orderFlatFieldMetadatasForSystemIndexView } from 'src/engine/metadata-modules/object-metadata/utils/order-flat-field-metadatas-for-system-index-view.util';

const NAME = { universalIdentifier: 'name-uid' };
const CREATED_AT = { universalIdentifier: 'created-at-uid' };
const CREATED_BY = { universalIdentifier: 'created-by-uid' };

describe('orderFlatFieldMetadatasForSystemIndexView', () => {
  it('should move the label identifier first when it is not already', () => {
    expect(
      orderFlatFieldMetadatasForSystemIndexView({
        flatFieldMetadatas: [CREATED_AT, NAME, CREATED_BY],
        labelIdentifierFieldMetadataUniversalIdentifier: 'name-uid',
      }),
    ).toEqual([NAME, CREATED_AT, CREATED_BY]);
  });

  it('should preserve the input order of every other field', () => {
    expect(
      orderFlatFieldMetadatasForSystemIndexView({
        flatFieldMetadatas: [NAME, CREATED_BY, CREATED_AT],
        labelIdentifierFieldMetadataUniversalIdentifier: 'name-uid',
      }),
    ).toEqual([NAME, CREATED_BY, CREATED_AT]);
  });

  it('should keep the input order when the object has no label identifier', () => {
    expect(
      orderFlatFieldMetadatasForSystemIndexView({
        flatFieldMetadatas: [CREATED_AT, NAME],
        labelIdentifierFieldMetadataUniversalIdentifier: null,
      }),
    ).toEqual([CREATED_AT, NAME]);
  });

  it('should keep the input order when the label identifier is not in the list', () => {
    expect(
      orderFlatFieldMetadatasForSystemIndexView({
        flatFieldMetadatas: [CREATED_AT, CREATED_BY],
        labelIdentifierFieldMetadataUniversalIdentifier: 'name-uid',
      }),
    ).toEqual([CREATED_AT, CREATED_BY]);
  });

  it('should not mutate the input array', () => {
    const flatFieldMetadatas = [CREATED_AT, NAME];

    orderFlatFieldMetadatasForSystemIndexView({
      flatFieldMetadatas,
      labelIdentifierFieldMetadataUniversalIdentifier: 'name-uid',
    });

    expect(flatFieldMetadatas).toEqual([CREATED_AT, NAME]);
  });
});
