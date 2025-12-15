import { type EachTestingContext } from 'twenty-shared/testing';
import {
  type FieldMetadataRelationSettings,
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';

import {
  generateMorphOrRelationFlatFieldMetadataPair,
  type SourceTargetMorphOrRelationFlatFieldAndFlatIndex,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-morph-or-relation-flat-field-metadata-pair.util';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';

type GenerateMorphOrRelationFlatFieldMetadataPairTestInput = Parameters<
  typeof generateMorphOrRelationFlatFieldMetadataPair
>[0];

type TestCase = EachTestingContext<{
  input: GenerateMorphOrRelationFlatFieldMetadataPairTestInput;
  expectedSourceFieldType: FieldMetadataType;
  expectedTargetFieldType: FieldMetadataType;
  expectedSourceRelationType: RelationType;
  expectedTargetRelationType: RelationType;
  shouldSourceHaveMorphId: boolean;
}>;

describe('generate Morph Or Relation Flat Field Metadata Pair test suite', () => {
  const mockWorkspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';
  const mockWorkspaceCustomApplicationId =
    '20202020-81ee-42da-a281-668632f32fe7';

  describe('Success cases', () => {
    const testCases: TestCase[] = [
      {
        title:
          'should generate a regular RELATION field pair with ONE_TO_MANY relation type',
        context: {
          input: {
            sourceFlatObjectMetadata: COMPANY_FLAT_OBJECT_MOCK,
            targetFlatObjectMetadata: PET_FLAT_OBJECT_MOCK,
            targetFlatFieldMetadataType: FieldMetadataType.RELATION,
            sourceFlatObjectMetadataJoinColumnName: 'petId',
            workspaceId: mockWorkspaceId,
            workspaceCustomApplicationId: mockWorkspaceCustomApplicationId,
            createFieldInput: {
              name: 'pets',
              label: 'Pets',
              description: 'Company pets',
              icon: 'IconCat',
              type: FieldMetadataType.RELATION,
              objectMetadataId: COMPANY_FLAT_OBJECT_MOCK.id,
              isCustom: true,
              isSystem: false,
              isUnique: false,
              relationCreationPayload: {
                type: RelationType.ONE_TO_MANY,
                targetObjectMetadataId: PET_FLAT_OBJECT_MOCK.id,
                targetFieldLabel: 'Company',
                targetFieldIcon: 'IconBuildingSkyscraper',
              },
            },
          },
          expectedSourceFieldType: FieldMetadataType.RELATION,
          expectedTargetFieldType: FieldMetadataType.RELATION,
          expectedSourceRelationType: RelationType.ONE_TO_MANY,
          expectedTargetRelationType: RelationType.MANY_TO_ONE,
          shouldSourceHaveMorphId: false,
        },
      },
      {
        title:
          'should generate a regular RELATION field pair with MANY_TO_ONE relation type',
        context: {
          input: {
            sourceFlatObjectMetadata: COMPANY_FLAT_OBJECT_MOCK,
            targetFlatObjectMetadata: PET_FLAT_OBJECT_MOCK,
            targetFlatFieldMetadataType: FieldMetadataType.RELATION,
            sourceFlatObjectMetadataJoinColumnName: 'petId',
            workspaceId: mockWorkspaceId,
            workspaceCustomApplicationId: mockWorkspaceCustomApplicationId,
            createFieldInput: {
              name: 'pets',
              label: 'Pets',
              description: 'Company pets',
              icon: 'IconCat',
              type: FieldMetadataType.RELATION,
              objectMetadataId: COMPANY_FLAT_OBJECT_MOCK.id,
              isCustom: true,
              isSystem: false,
              isUnique: false,
              relationCreationPayload: {
                type: RelationType.MANY_TO_ONE,
                targetObjectMetadataId: PET_FLAT_OBJECT_MOCK.id,
                targetFieldLabel: 'Company',
                targetFieldIcon: 'IconBuildingSkyscraper',
              },
            },
          },
          expectedSourceFieldType: FieldMetadataType.RELATION,
          expectedTargetFieldType: FieldMetadataType.RELATION,
          expectedSourceRelationType: RelationType.MANY_TO_ONE,
          expectedTargetRelationType: RelationType.ONE_TO_MANY,
          shouldSourceHaveMorphId: false,
        },
      },
      {
        title:
          'should generate a regular RELATION with isCustom, isSytem, isUnique not default values',
        context: {
          input: {
            sourceFlatObjectMetadata: COMPANY_FLAT_OBJECT_MOCK,
            targetFlatObjectMetadata: PET_FLAT_OBJECT_MOCK,
            targetFlatFieldMetadataType: FieldMetadataType.RELATION,
            sourceFlatObjectMetadataJoinColumnName: 'petId',
            workspaceId: mockWorkspaceId,
            workspaceCustomApplicationId: mockWorkspaceCustomApplicationId,
            createFieldInput: {
              name: 'pets',
              label: 'Pets',
              description: 'Company pets',
              icon: 'IconCat',
              type: FieldMetadataType.RELATION,
              objectMetadataId: COMPANY_FLAT_OBJECT_MOCK.id,
              isCustom: false,
              isSystem: true,
              isUnique: true,
              relationCreationPayload: {
                type: RelationType.MANY_TO_ONE,
                targetObjectMetadataId: PET_FLAT_OBJECT_MOCK.id,
                targetFieldLabel: 'Company',
                targetFieldIcon: 'IconBuildingSkyscraper',
              },
            },
          },
          expectedSourceFieldType: FieldMetadataType.RELATION,
          expectedTargetFieldType: FieldMetadataType.RELATION,
          expectedSourceRelationType: RelationType.MANY_TO_ONE,
          expectedTargetRelationType: RelationType.ONE_TO_MANY,
          shouldSourceHaveMorphId: false,
        },
      },
      {
        title:
          'should generate a MORPH_RELATION (MANY_TO_ONE) field pair with morphId when provided',
        context: {
          input: {
            sourceFlatObjectMetadata: COMPANY_FLAT_OBJECT_MOCK,
            targetFlatObjectMetadata: PET_FLAT_OBJECT_MOCK,
            targetFlatFieldMetadataType: FieldMetadataType.RELATION,
            sourceFlatObjectMetadataJoinColumnName: 'targetPetId',
            workspaceId: mockWorkspaceId,
            workspaceCustomApplicationId: mockWorkspaceCustomApplicationId,
            morphId: '20202020-9a2b-4c3d-a4e5-f6a7b8c9d0e1',
            createFieldInput: {
              name: 'targetPet',
              label: 'Target Pet',
              description: 'Morph relation to pet',
              icon: 'IconCat',
              type: FieldMetadataType.MORPH_RELATION,
              objectMetadataId: COMPANY_FLAT_OBJECT_MOCK.id,
              isCustom: false,
              isSystem: true,
              isUnique: false,
              relationCreationPayload: {
                type: RelationType.MANY_TO_ONE,
                targetObjectMetadataId: PET_FLAT_OBJECT_MOCK.id,
                targetFieldLabel: 'Companies',
                targetFieldIcon: 'IconBuildingSkyscraper',
              },
            },
          },
          expectedSourceFieldType: FieldMetadataType.MORPH_RELATION,
          expectedTargetFieldType: FieldMetadataType.RELATION,
          expectedSourceRelationType: RelationType.MANY_TO_ONE,
          expectedTargetRelationType: RelationType.ONE_TO_MANY,
          shouldSourceHaveMorphId: true,
        },
      },
      {
        title:
          'should generate a MORPH_RELATION (ONE_TO_MANY) field pair with morphId when provided',
        context: {
          input: {
            sourceFlatObjectMetadata: COMPANY_FLAT_OBJECT_MOCK,
            targetFlatObjectMetadata: PET_FLAT_OBJECT_MOCK,
            targetFlatFieldMetadataType: FieldMetadataType.RELATION,
            sourceFlatObjectMetadataJoinColumnName: 'targetPetId',
            workspaceId: mockWorkspaceId,
            workspaceCustomApplicationId: mockWorkspaceCustomApplicationId,
            morphId: '20202020-9a2b-4c3d-a4e5-f6a7b8c9d0e1',
            createFieldInput: {
              name: 'targetPet',
              label: 'Target Pet',
              description: 'Morph relation to pet',
              icon: 'IconCat',
              type: FieldMetadataType.MORPH_RELATION,
              objectMetadataId: COMPANY_FLAT_OBJECT_MOCK.id,
              isCustom: false,
              isSystem: true,
              isUnique: false,
              relationCreationPayload: {
                type: RelationType.ONE_TO_MANY,
                targetObjectMetadataId: PET_FLAT_OBJECT_MOCK.id,
                targetFieldLabel: 'Companies',
                targetFieldIcon: 'IconBuildingSkyscraper',
              },
            },
          },
          expectedSourceFieldType: FieldMetadataType.MORPH_RELATION,
          expectedTargetFieldType: FieldMetadataType.RELATION,
          expectedSourceRelationType: RelationType.ONE_TO_MANY,
          expectedTargetRelationType: RelationType.MANY_TO_ONE,
          shouldSourceHaveMorphId: true,
        },
      },
      {
        title:
          'should generate a MORPH_RELATION (ONE_TO_MANY) field pair with MORPH as target',
        context: {
          input: {
            sourceFlatObjectMetadata: COMPANY_FLAT_OBJECT_MOCK,
            targetFlatObjectMetadata: PET_FLAT_OBJECT_MOCK,
            targetFlatFieldMetadataType: FieldMetadataType.MORPH_RELATION,
            sourceFlatObjectMetadataJoinColumnName: 'targetPetId',
            workspaceId: mockWorkspaceId,
            workspaceCustomApplicationId: mockWorkspaceCustomApplicationId,
            morphId: '20202020-9a2b-4c3d-a4e5-f6a7b8c9d0e1',
            createFieldInput: {
              name: 'targetPet',
              label: 'Target Pet',
              description: 'Morph relation to pet',
              icon: 'IconCat',
              type: FieldMetadataType.RELATION,
              objectMetadataId: COMPANY_FLAT_OBJECT_MOCK.id,
              isCustom: false,
              isSystem: true,
              isUnique: false,
              relationCreationPayload: {
                type: RelationType.ONE_TO_MANY,
                targetObjectMetadataId: PET_FLAT_OBJECT_MOCK.id,
                targetFieldLabel: 'Companies',
                targetFieldIcon: 'IconBuildingSkyscraper',
              },
            },
          },
          expectedSourceFieldType: FieldMetadataType.RELATION,
          expectedTargetFieldType: FieldMetadataType.MORPH_RELATION,
          expectedSourceRelationType: RelationType.ONE_TO_MANY,
          expectedTargetRelationType: RelationType.MANY_TO_ONE,
          shouldSourceHaveMorphId: false,
        },
      },
    ];

    test.each(testCases)(
      '$title',
      ({
        context: {
          input,
          expectedSourceFieldType,
          expectedTargetFieldType,
          expectedSourceRelationType,
          expectedTargetRelationType,
          shouldSourceHaveMorphId,
        },
      }) => {
        const result: SourceTargetMorphOrRelationFlatFieldAndFlatIndex =
          generateMorphOrRelationFlatFieldMetadataPair(input);

        expect(result.flatFieldMetadatas).toHaveLength(2);
        expect(result.indexMetadatas).toHaveLength(1);

        const [sourceFieldMetadata, targetFieldMetadata] =
          result.flatFieldMetadatas;

        expect(sourceFieldMetadata.type).toBe(expectedSourceFieldType);
        expect(sourceFieldMetadata.name).toBe(input.createFieldInput.name);
        expect(sourceFieldMetadata.label).toBe(input.createFieldInput.label);
        expect(sourceFieldMetadata.objectMetadataId).toBe(
          input.sourceFlatObjectMetadata.id,
        );
        expect(sourceFieldMetadata.relationTargetObjectMetadataId).toBe(
          input.targetFlatObjectMetadata.id,
        );
        const sourceSettings =
          sourceFieldMetadata.settings as FieldMetadataRelationSettings;
        const targetSettings =
          targetFieldMetadata.settings as FieldMetadataRelationSettings;

        expect(sourceSettings.relationType).toBe(expectedSourceRelationType);

        if (shouldSourceHaveMorphId) {
          expect(sourceFieldMetadata.morphId).toBe(input.morphId);
        } else {
          expect(sourceFieldMetadata.morphId).toBeNull();
        }

        expect(targetFieldMetadata.type).toBe(expectedTargetFieldType);
        expect(targetFieldMetadata.objectMetadataId).toBe(
          input.targetFlatObjectMetadata.id,
        );
        expect(targetFieldMetadata.relationTargetObjectMetadataId).toBe(
          input.sourceFlatObjectMetadata.id,
        );
        expect(targetSettings.relationType).toBe(expectedTargetRelationType);

        expect(sourceFieldMetadata.relationTargetFieldMetadataId).toBe(
          targetFieldMetadata.id,
        );
        expect(targetFieldMetadata.relationTargetFieldMetadataId).toBe(
          sourceFieldMetadata.id,
        );

        if (expectedSourceRelationType === RelationType.MANY_TO_ONE) {
          expect(sourceSettings.joinColumnName).toBe(
            input.sourceFlatObjectMetadataJoinColumnName,
          );
          expect(sourceSettings.onDelete).toBe(RelationOnDeleteAction.SET_NULL);
        }

        if (expectedTargetRelationType === RelationType.MANY_TO_ONE) {
          expect(targetSettings.joinColumnName).toBeDefined();
          expect(targetSettings.onDelete).toBe(RelationOnDeleteAction.SET_NULL);
        }
      },
    );
  });
});
