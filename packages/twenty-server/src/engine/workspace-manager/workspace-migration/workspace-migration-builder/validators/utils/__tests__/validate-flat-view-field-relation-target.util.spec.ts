import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { validateFlatViewFieldRelationTarget } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-field-relation-target.util';

const PERSON_OBJECT = 'person-object';
const COMPANY_OBJECT = 'company-object';

const PERSON_COMPANY_FIELD = {
  type: FieldMetadataType.RELATION,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'companyId',
  },
  objectMetadataUniversalIdentifier: PERSON_OBJECT,
  relationTargetObjectMetadataUniversalIdentifier: COMPANY_OBJECT,
};

const COMPANY_PEOPLE_FIELD = {
  type: FieldMetadataType.RELATION,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
  objectMetadataUniversalIdentifier: COMPANY_OBJECT,
  relationTargetObjectMetadataUniversalIdentifier: PERSON_OBJECT,
};

const COMPANY_INDUSTRY_FIELD = {
  type: FieldMetadataType.SELECT,
  universalSettings: null,
  objectMetadataUniversalIdentifier: COMPANY_OBJECT,
  relationTargetObjectMetadataUniversalIdentifier: null,
};

const PERSON_CITY_FIELD = {
  ...COMPANY_INDUSTRY_FIELD,
  type: FieldMetadataType.TEXT,
  objectMetadataUniversalIdentifier: PERSON_OBJECT,
};

describe('validateFlatViewFieldRelationTarget', () => {
  it('accepts a field of the related record on an added many-to-one column', () => {
    expect(
      validateFlatViewFieldRelationTarget({
        isCanonical: false,
        flatFieldMetadata: PERSON_COMPANY_FIELD,
        relationTargetFlatFieldMetadata: COMPANY_INDUSTRY_FIELD,
      }),
    ).toEqual([]);
  });

  it.each([
    {
      title: 'a canonical column',
      isCanonical: true,
      flatFieldMetadata: PERSON_COMPANY_FIELD,
      relationTargetFlatFieldMetadata: COMPANY_INDUSTRY_FIELD,
      expectedMessage: 'Only non-canonical view fields',
    },
    {
      title: 'a field that is not a relation',
      isCanonical: false,
      flatFieldMetadata: PERSON_CITY_FIELD,
      relationTargetFlatFieldMetadata: COMPANY_INDUSTRY_FIELD,
      expectedMessage: 'many-to-one relation field',
    },
    {
      title: 'a one-to-many relation',
      isCanonical: false,
      flatFieldMetadata: COMPANY_PEOPLE_FIELD,
      relationTargetFlatFieldMetadata: PERSON_CITY_FIELD,
      expectedMessage: 'many-to-one relation field',
    },
    {
      title: 'a target field on another object',
      isCanonical: false,
      flatFieldMetadata: PERSON_COMPANY_FIELD,
      relationTargetFlatFieldMetadata: PERSON_CITY_FIELD,
      expectedMessage: 'must belong to the relation target object',
    },
    {
      title: 'a missing target field',
      isCanonical: false,
      flatFieldMetadata: PERSON_COMPANY_FIELD,
      relationTargetFlatFieldMetadata: undefined,
      expectedMessage: 'must belong to the relation target object',
    },
    {
      title: 'a target field that is a relation',
      isCanonical: false,
      flatFieldMetadata: PERSON_COMPANY_FIELD,
      relationTargetFlatFieldMetadata: COMPANY_PEOPLE_FIELD,
      expectedMessage: 'cannot be a relation',
    },
  ])(
    'rejects $title',
    ({
      isCanonical,
      flatFieldMetadata,
      relationTargetFlatFieldMetadata,
      expectedMessage,
    }) => {
      const errors = validateFlatViewFieldRelationTarget({
        isCanonical,
        flatFieldMetadata,
        relationTargetFlatFieldMetadata,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain(expectedMessage);
    },
  );
});
