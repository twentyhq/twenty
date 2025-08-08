import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataException } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { shouldCreateUniqueIndex } from 'src/engine/metadata-modules/index-metadata/utils/should-create-unique-index.util';

describe('shouldCreateUniqueIndex', () => {
  it('should return false if field to create is not unique', () => {
    const field = {
      name: 'testField',
      label: 'Test Field',
      type: FieldMetadataType.TEXT,
      objectMetadataId: 'test-object-id',
    } as CreateFieldInput;

    const result = shouldCreateUniqueIndex(false, field);

    expect(result).toBe(false);

    const resultUndefined = shouldCreateUniqueIndex(undefined, field);

    expect(resultUndefined).toBe(false);
  });

  it('should return true if field to create is unique and if field type enable unicity', () => {
    const field = {
      name: 'testField',
      label: 'Test Field',
      type: FieldMetadataType.TEXT,
      objectMetadataId: 'test-object-id',
    } as CreateFieldInput;

    const result = shouldCreateUniqueIndex(true, field);

    expect(result).toBe(true);
  });

  it('should throw an error if field to create is a MORPH type', () => {
    const field = {
      name: 'testField',
      label: 'Test Field',
      type: FieldMetadataType.MORPH_RELATION,
      objectMetadataId: 'test-object-id',
    } as CreateFieldInput;

    expect(() => shouldCreateUniqueIndex(true, field)).toThrow(
      FieldMetadataException,
    );
    expect(() => shouldCreateUniqueIndex(true, field)).toThrow(
      'Unique index cannot be created for field testField of type MORPH_RELATION',
    );
  });

  it('should throw an error if field to create is a RELATION type - ONE_TO_MANY', () => {
    const field = {
      name: 'testField',
      label: 'Test Field',
      type: FieldMetadataType.RELATION,
      objectMetadataId: 'test-object-id',
      settings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    } as CreateFieldInput;

    expect(() => shouldCreateUniqueIndex(true, field)).toThrow(
      FieldMetadataException,
    );
    expect(() => shouldCreateUniqueIndex(true, field)).toThrow(
      'Unique index cannot be created for field testField of type RELATION',
    );
  });

  it('should throw an error if field to create is a FULL_NAME type', () => {
    const field = {
      name: 'testField',
      label: 'Test Field',
      type: FieldMetadataType.FULL_NAME,
      objectMetadataId: 'test-object-id',
    } as CreateFieldInput;

    expect(() => shouldCreateUniqueIndex(true, field)).toThrow(
      FieldMetadataException,
    );
    expect(() => shouldCreateUniqueIndex(true, field)).toThrow(
      'Unique index cannot be created for field testField of type FULL_NAME',
    );
  });

  it('should throw an error if field to create is an ADDRESS type', () => {
    const field = {
      name: 'testField',
      label: 'Test Field',
      type: FieldMetadataType.ADDRESS,
      objectMetadataId: 'test-object-id',
    } as CreateFieldInput;

    expect(() => shouldCreateUniqueIndex(true, field)).toThrow(
      FieldMetadataException,
    );
    expect(() => shouldCreateUniqueIndex(true, field)).toThrow(
      'Unique index cannot be created for field testField of type ADDRESS',
    );
  });
});
