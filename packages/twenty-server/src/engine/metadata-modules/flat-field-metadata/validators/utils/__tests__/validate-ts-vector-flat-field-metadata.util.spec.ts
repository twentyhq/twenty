import { FieldMetadataType } from 'twenty-shared/types';

import { validateTsVectorFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-ts-vector-flat-field-metadata.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const callValidator = (
  overrides: Partial<
    UniversalFlatFieldMetadata<FieldMetadataType.TS_VECTOR>
  > = {},
) =>
  validateTsVectorFlatFieldMetadata({
    flatEntityToValidate: {
      type: FieldMetadataType.TS_VECTOR,
      name: 'searchVector',
      isSystem: true,
      ...overrides,
    },
  } as Parameters<typeof validateTsVectorFlatFieldMetadata>[0]);

describe('validateTsVectorFlatFieldMetadata', () => {
  it('should return no errors for a system search vector', () => {
    expect(callValidator()).toEqual([]);
  });

  it('should reject a search vector with another name', () => {
    expect(callValidator({ name: 'otherVector' })).toEqual([
      expect.objectContaining({
        message:
          'Field type TS_VECTOR must be named "searchVector", got "otherVector"',
      }),
    ]);
  });

  it('should reject a search vector that is not a system field', () => {
    expect(callValidator({ isSystem: false })).toEqual([
      expect.objectContaining({
        message: 'Field type TS_VECTOR must be a system field',
      }),
    ]);
  });
});
