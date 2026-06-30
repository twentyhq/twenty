import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { validateRelationSubfield } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-relation-subfield.util';

const PET_OBJECT_ID = 'pet-object-id';
const ROCKET_OBJECT_ID = 'rocket-object-id';
const SURVEY_RESULT_OBJECT_ID = 'survey-result-object-id';

const buildFieldsByObjectId = (
  fields: FlatFieldMetadata[],
): Map<string, FlatFieldMetadata[]> => {
  const map = new Map<string, FlatFieldMetadata[]>();

  for (const field of fields) {
    const existing = map.get(field.objectMetadataId) ?? [];

    existing.push(field);
    map.set(field.objectMetadataId, existing);
  }

  return map;
};

describe('validateRelationSubfield', () => {
  it('should resolve the concrete target for a per-target morph field with multiple targets', () => {
    const morphId = 'polymorphic-owner-morph-id';

    const morphToRocket = getFlatFieldMetadataMock({
      universalIdentifier: 'morph-rocket',
      objectMetadataId: PET_OBJECT_ID,
      type: FieldMetadataType.MORPH_RELATION,
      name: 'polymorphicOwnerRocket',
      morphId,
      relationTargetObjectMetadataId: ROCKET_OBJECT_ID,
    });
    const morphToSurveyResult = getFlatFieldMetadataMock({
      universalIdentifier: 'morph-survey-result',
      objectMetadataId: PET_OBJECT_ID,
      type: FieldMetadataType.MORPH_RELATION,
      name: 'polymorphicOwnerSurveyResult',
      morphId,
      relationTargetObjectMetadataId: SURVEY_RESULT_OBJECT_ID,
    });
    const rocketNameField = getFlatFieldMetadataMock({
      universalIdentifier: 'rocket-name',
      objectMetadataId: ROCKET_OBJECT_ID,
      type: FieldMetadataType.TEXT,
      name: 'name',
    });

    const allFields = [morphToRocket, morphToSurveyResult, rocketNameField];

    expect(() =>
      validateRelationSubfield({
        field: morphToRocket,
        subFieldName: 'name',
        paramName: morphToRocket.name,
        allFields,
        fieldsByObjectId: buildFieldsByObjectId(allFields),
      }),
    ).not.toThrow();
  });

  it('should throw when the nested subfield does not exist on the resolved target', () => {
    const morphId = 'polymorphic-owner-morph-id';

    const morphToRocket = getFlatFieldMetadataMock({
      universalIdentifier: 'morph-rocket',
      objectMetadataId: PET_OBJECT_ID,
      type: FieldMetadataType.MORPH_RELATION,
      name: 'polymorphicOwnerRocket',
      morphId,
      relationTargetObjectMetadataId: ROCKET_OBJECT_ID,
    });
    const rocketNameField = getFlatFieldMetadataMock({
      universalIdentifier: 'rocket-name',
      objectMetadataId: ROCKET_OBJECT_ID,
      type: FieldMetadataType.TEXT,
      name: 'name',
    });

    const allFields = [morphToRocket, rocketNameField];

    expect(() =>
      validateRelationSubfield({
        field: morphToRocket,
        subFieldName: 'nonExistingField',
        paramName: morphToRocket.name,
        allFields,
        fieldsByObjectId: buildFieldsByObjectId(allFields),
      }),
    ).toThrow('not found');
  });
});
