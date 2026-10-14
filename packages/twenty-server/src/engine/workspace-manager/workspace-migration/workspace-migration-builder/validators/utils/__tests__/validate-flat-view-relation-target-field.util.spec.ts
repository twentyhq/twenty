import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { validateFlatViewRelationTargetField } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-relation-target-field.util';

const PERSON_OBJECT_UNIVERSAL_IDENTIFIER = 'person-object';
const COMPANY_OBJECT_UNIVERSAL_IDENTIFIER = 'company-object';
const ERROR_CODE = 'INVALID_VIEW_DATA';

const flatView = {
  objectMetadataUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
} as UniversalFlatView;

const buildFlatFieldMetadataMaps = (flatFieldMetadatas: FlatFieldMetadata[]) =>
  flatFieldMetadatas.reduce<FlatEntityMaps<FlatFieldMetadata>>(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  );

const personCompanyRelationField = getFlatFieldMetadataMock({
  id: 'person-company-id',
  universalIdentifier: 'person-company',
  objectMetadataId: 'person-object-id',
  objectMetadataUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetObjectMetadataUniversalIdentifier:
    COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldMetadataType.RELATION,
  universalSettings: { relationType: RelationType.MANY_TO_ONE },
});

const companyEmployeesField = getFlatFieldMetadataMock({
  id: 'company-employees-id',
  universalIdentifier: 'company-employees',
  objectMetadataId: 'company-object-id',
  objectMetadataUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldMetadataType.NUMBER,
});

const companyAccountOwnerField = getFlatFieldMetadataMock({
  id: 'company-account-owner-id',
  universalIdentifier: 'company-account-owner',
  objectMetadataId: 'company-object-id',
  objectMetadataUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetObjectMetadataUniversalIdentifier: 'workspace-member-object',
  type: FieldMetadataType.RELATION,
  universalSettings: { relationType: RelationType.MANY_TO_ONE },
});

const personCityField = getFlatFieldMetadataMock({
  id: 'person-city-id',
  universalIdentifier: 'person-city',
  objectMetadataId: 'person-object-id',
  objectMetadataUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldMetadataType.TEXT,
});

const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
  personCompanyRelationField,
  companyEmployeesField,
  companyAccountOwnerField,
  personCityField,
]);

describe('validateFlatViewRelationTargetField', () => {
  it('accepts a scalar field reached through a many-to-one relation of the view object', () => {
    const result = validateFlatViewRelationTargetField({
      sourceFlatFieldMetadata: personCompanyRelationField,
      relationTargetFieldMetadataUniversalIdentifier:
        companyEmployeesField.universalIdentifier,
      flatView,
      flatFieldMetadataMaps,
      errorCode: ERROR_CODE,
    });

    expect(result.errors).toEqual([]);
    expect(result.relationTargetFlatFieldMetadata?.universalIdentifier).toBe(
      companyEmployeesField.universalIdentifier,
    );
  });

  it('rejects a one-to-many source relation', () => {
    const result = validateFlatViewRelationTargetField({
      sourceFlatFieldMetadata: {
        ...personCompanyRelationField,
        universalSettings: { relationType: RelationType.ONE_TO_MANY },
      },
      relationTargetFieldMetadataUniversalIdentifier:
        companyEmployeesField.universalIdentifier,
      flatView,
      flatFieldMetadataMaps,
      errorCode: ERROR_CODE,
    });

    expect(result.errors).toEqual([
      expect.objectContaining({
        code: ERROR_CODE,
        message:
          'Relation target field requires fieldMetadataId to be a many-to-one relation field',
      }),
    ]);
  });

  it('rejects a junction relation source', () => {
    const result = validateFlatViewRelationTargetField({
      sourceFlatFieldMetadata: {
        ...personCompanyRelationField,
        universalSettings: {
          relationType: RelationType.MANY_TO_ONE,
          junctionTargetFieldUniversalIdentifier: 'junction-target-field',
        },
      },
      relationTargetFieldMetadataUniversalIdentifier:
        companyEmployeesField.universalIdentifier,
      flatView,
      flatFieldMetadataMaps,
      errorCode: ERROR_CODE,
    });

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toBe(
      'Relation target field requires fieldMetadataId to be a many-to-one relation field',
    );
  });

  it('rejects a non-relation source field', () => {
    const result = validateFlatViewRelationTargetField({
      sourceFlatFieldMetadata: personCityField,
      relationTargetFieldMetadataUniversalIdentifier:
        companyEmployeesField.universalIdentifier,
      flatView,
      flatFieldMetadataMaps,
      errorCode: ERROR_CODE,
    });

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toBe(
      'Relation target field requires fieldMetadataId to be a many-to-one relation field',
    );
  });

  it('rejects a source relation that does not belong to the view object', () => {
    const result = validateFlatViewRelationTargetField({
      sourceFlatFieldMetadata: personCompanyRelationField,
      relationTargetFieldMetadataUniversalIdentifier:
        companyEmployeesField.universalIdentifier,
      flatView: {
        objectMetadataUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
      } as UniversalFlatView,
      flatFieldMetadataMaps,
      errorCode: ERROR_CODE,
    });

    expect(result.errors).toEqual([
      expect.objectContaining({
        message: 'Relation field does not belong to the view object',
      }),
    ]);
  });

  it('rejects a missing target field', () => {
    const result = validateFlatViewRelationTargetField({
      sourceFlatFieldMetadata: personCompanyRelationField,
      relationTargetFieldMetadataUniversalIdentifier: 'missing-field',
      flatView,
      flatFieldMetadataMaps,
      errorCode: ERROR_CODE,
    });

    expect(result.errors).toEqual([
      expect.objectContaining({
        message: 'Relation target field metadata not found',
      }),
    ]);
    expect(result.relationTargetFlatFieldMetadata).toBeUndefined();
  });

  it('rejects a target field that lives on another object than the relation target', () => {
    const result = validateFlatViewRelationTargetField({
      sourceFlatFieldMetadata: personCompanyRelationField,
      relationTargetFieldMetadataUniversalIdentifier:
        personCityField.universalIdentifier,
      flatView,
      flatFieldMetadataMaps,
      errorCode: ERROR_CODE,
    });

    expect(result.errors).toEqual([
      expect.objectContaining({
        message:
          'Relation target field does not belong to the object the relation points to',
      }),
    ]);
  });

  it('rejects a target field that is itself a relation', () => {
    const result = validateFlatViewRelationTargetField({
      sourceFlatFieldMetadata: personCompanyRelationField,
      relationTargetFieldMetadataUniversalIdentifier:
        companyAccountOwnerField.universalIdentifier,
      flatView,
      flatFieldMetadataMaps,
      errorCode: ERROR_CODE,
    });

    expect(result.errors).toEqual([
      expect.objectContaining({
        message: 'Relation target field cannot be a relation field',
      }),
    ]);
  });
});
