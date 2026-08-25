import { MetadataWritability } from 'twenty-shared/types';

import { buildSearchVectorFlatFieldMetadataForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-search-vector-flat-field-metadata-for-custom-object.util';

describe('buildSearchVectorFlatFieldMetadataForCustomObject', () => {
  const searchVector = buildSearchVectorFlatFieldMetadataForCustomObject({
    flatObjectMetadata: {
      universalIdentifier: '20202020-1111-4111-8111-111111111111',
      applicationUniversalIdentifier: '20202020-2222-4222-8222-222222222222',
    },
  });

  it('marks the search vector field as SYSTEM, since Postgres generates the column', () => {
    expect(searchVector.writability).toBe(MetadataWritability.SYSTEM);
  });
});
