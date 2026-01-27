import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { isRelationNestedFieldDateKind } from 'src/modules/dashboard/chart-data/utils/is-relation-nested-field-date-kind.util';

const createMockFieldMetadata = (
  overrides: Partial<FlatFieldMetadata>,
): FlatFieldMetadata =>
  ({
    id: 'test-field-id',
    name: 'testField',
    type: FieldMetadataType.TEXT,
    universalIdentifier: 'test-universal-id',
    ...overrides,
  }) as FlatFieldMetadata;

const createMockObjectMetadata = (
  overrides: Partial<FlatObjectMetadata>,
): FlatObjectMetadata =>
  ({
    id: 'test-object-id',
    nameSingular: 'testObject',
    namePlural: 'testObjects',
    fieldIds: [],
    universalIdentifier: 'test-object-universal-id',
    ...overrides,
  }) as FlatObjectMetadata;

describe('isRelationNestedFieldDateKind', () => {
  const companyObjectId = 'company-object-id';
  const createdAtFieldId = 'created-at-field-id';
  const nameFieldId = 'name-field-id';

  const createdAtField = createMockFieldMetadata({
    id: createdAtFieldId,
    name: 'createdAt',
    type: FieldMetadataType.DATE_TIME,
    universalIdentifier: 'created-at-universal-id',
  });

  const nameField = createMockFieldMetadata({
    id: nameFieldId,
    name: 'name',
    type: FieldMetadataType.TEXT,
    universalIdentifier: 'name-universal-id',
  });

  const companyObject = createMockObjectMetadata({
    id: companyObjectId,
    nameSingular: 'company',
    namePlural: 'companies',
    fieldIds: [createdAtFieldId, nameFieldId],
  });

  const relationField = createMockFieldMetadata({
    id: 'relation-field-id',
    name: 'company',
    type: FieldMetadataType.RELATION,
    relationTargetObjectMetadataId: companyObjectId,
    universalIdentifier: 'relation-universal-id',
  });

  const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> = {
    byId: {
      [companyObjectId]: companyObject,
    },
    idByUniversalIdentifier: {},
    universalIdentifiersByApplicationId: {},
  };

  const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
    byId: {
      [createdAtFieldId]: createdAtField,
      [nameFieldId]: nameField,
    },
    idByUniversalIdentifier: {},
    universalIdentifiersByApplicationId: {},
  };

  it('should return true for a relation subfield that is a date type', () => {
    const result = isRelationNestedFieldDateKind({
      relationFieldMetadata: relationField,
      relationNestedFieldName: 'createdAt',
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(result).toBe(true);
  });

  it('should return false when the nested subfield is not a date type', () => {
    const result = isRelationNestedFieldDateKind({
      relationFieldMetadata: relationField,
      relationNestedFieldName: 'name',
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(result).toBe(false);
  });

  it('should return false when relationNestedFieldName is undefined', () => {
    const result = isRelationNestedFieldDateKind({
      relationFieldMetadata: relationField,
      relationNestedFieldName: undefined,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(result).toBe(false);
  });

  it('should return false for non-relation fields', () => {
    const nonRelationField = createMockFieldMetadata({
      name: 'status',
      type: FieldMetadataType.TEXT,
    });

    const result = isRelationNestedFieldDateKind({
      relationFieldMetadata: nonRelationField,
      relationNestedFieldName: 'createdAt',
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(result).toBe(false);
  });

  it('should return false when target object is not found', () => {
    const relationFieldWithMissingTarget = createMockFieldMetadata({
      name: 'company',
      type: FieldMetadataType.RELATION,
      relationTargetObjectMetadataId: 'non-existent-object-id',
    });

    const result = isRelationNestedFieldDateKind({
      relationFieldMetadata: relationFieldWithMissingTarget,
      relationNestedFieldName: 'createdAt',
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(result).toBe(false);
  });

  it('should return false when nested field is not found', () => {
    const result = isRelationNestedFieldDateKind({
      relationFieldMetadata: relationField,
      relationNestedFieldName: 'nonExistentField',
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(result).toBe(false);
  });

  it('should handle composite nested field names', () => {
    const result = isRelationNestedFieldDateKind({
      relationFieldMetadata: relationField,
      relationNestedFieldName: 'createdAt.subField',
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(result).toBe(true);
  });

  it('should return true for DATE type field', () => {
    const dateFieldId = 'date-field-id';
    const dateField = createMockFieldMetadata({
      id: dateFieldId,
      name: 'birthDate',
      type: FieldMetadataType.DATE,
      universalIdentifier: 'date-universal-id',
    });

    const objectWithDateField = createMockObjectMetadata({
      id: 'object-with-date-id',
      nameSingular: 'person',
      namePlural: 'people',
      fieldIds: [dateFieldId],
    });

    const personRelationField = createMockFieldMetadata({
      name: 'person',
      type: FieldMetadataType.RELATION,
      relationTargetObjectMetadataId: 'object-with-date-id',
    });

    const result = isRelationNestedFieldDateKind({
      relationFieldMetadata: personRelationField,
      relationNestedFieldName: 'birthDate',
      flatObjectMetadataMaps: {
        byId: { 'object-with-date-id': objectWithDateField },
        idByUniversalIdentifier: {},
        universalIdentifiersByApplicationId: {},
      },
      flatFieldMetadataMaps: {
        byId: { [dateFieldId]: dateField },
        idByUniversalIdentifier: {},
        universalIdentifiersByApplicationId: {},
      },
    });

    expect(result).toBe(true);
  });

  it('should return false when relationTargetObjectMetadataId is undefined', () => {
    const relationFieldWithoutTarget = createMockFieldMetadata({
      name: 'company',
      type: FieldMetadataType.RELATION,
      relationTargetObjectMetadataId: undefined,
    });

    const result = isRelationNestedFieldDateKind({
      relationFieldMetadata: relationFieldWithoutTarget,
      relationNestedFieldName: 'createdAt',
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(result).toBe(false);
  });
});
