import { FieldMetadataType, MetadataWritability } from 'twenty-shared/types';

import { validateTsVectorFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-ts-vector-flat-field-metadata.util';
import { type UniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const createFlatEntityToValidate = (
  overrides: Partial<
    UniversalFlatFieldMetadata<FieldMetadataType.TS_VECTOR>
  > = {},
): UniversalFlatFieldMetadata<FieldMetadataType.TS_VECTOR> =>
  ({
    type: FieldMetadataType.TS_VECTOR,
    name: 'searchVector',
    isSystem: true,
    writability: MetadataWritability.SYSTEM,
    ...overrides,
  }) as UniversalFlatFieldMetadata<FieldMetadataType.TS_VECTOR>;

const callValidator = (
  flatEntityToValidate: UniversalFlatFieldMetadata<FieldMetadataType.TS_VECTOR>,
  update?: UniversalFlatEntityUpdate<'fieldMetadata'>,
) =>
  validateTsVectorFlatFieldMetadata({
    flatEntityToValidate,
    update,
  } as Parameters<typeof validateTsVectorFlatFieldMetadata>[0]);

describe('validateTsVectorFlatFieldMetadata', () => {
  it('should return no errors for a SYSTEM writability search vector', () => {
    const errors = callValidator(createFlatEntityToValidate());

    expect(errors).toEqual([]);
  });

  it('should reject a create with non-SYSTEM writability', () => {
    const errors = callValidator(
      createFlatEntityToValidate({ writability: MetadataWritability.OPEN }),
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(
      'Field type TS_VECTOR must have SYSTEM writability',
    );
  });

  it('should reject an update that sets non-SYSTEM writability', () => {
    const errors = callValidator(
      createFlatEntityToValidate({ writability: MetadataWritability.OPEN }),
      { writability: MetadataWritability.OPEN },
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(
      'Field type TS_VECTOR must have SYSTEM writability',
    );
  });

  it('should accept an update leaving writability untouched on a not-yet-migrated OPEN search vector', () => {
    const errors = callValidator(
      createFlatEntityToValidate({ writability: MetadataWritability.OPEN }),
      { isActive: false },
    );

    expect(errors).toEqual([]);
  });
});
