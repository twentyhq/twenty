import { type EachTestingContext } from 'twenty-shared/testing';
import {
  type FieldMetadataSettingsMapping,
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import {
  generateMorphOrRelationFlatFieldMetadataPair,
  type SourceTargetMorphOrRelationFlatFieldAndFlatIndex,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-morph-or-relation-flat-field-metadata-pair.util';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';

const MOCK_FLAT_APPLICATION: FlatApplication = {
  id: '20202020-81ee-42da-a281-668632f32fe7',
  universalIdentifier: '20202020-81ee-42da-a281-668632f32fe7',
  name: 'Workspace Custom Application',
  description: null,
  version: null,
  workspaceId: 'workspace-id',
  sourceType: 'local',
  sourcePath: '',
  packageJsonChecksum: null,
  packageJsonFileId: null,
  yarnLockChecksum: null,
  yarnLockFileId: null,
  availablePackages: {},
  logicFunctionLayerId: null,
  defaultRoleId: null,
  defaultRole: null,
  canBeUninstalled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

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
            flatApplication: MOCK_FLAT_APPLICATION,
            createFieldInput: {
              name: 'pets',
              label: 'Pets',
              description: 'Company pets',
              icon: 'IconCat',
              type: FieldMetadataType.RELATION,
              isCustom: true,
              isSystem: false,
              isUnique: false,
              relationCreationPayload: {
                type: RelationType.ONE_TO_MANY,
                targetObjectMetadataId:
                  PET_FLAT_OBJECT_MOCK.universalIdentifier,
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
            flatApplication: MOCK_FLAT_APPLICATION,
            createFieldInput: {
              name: 'pets',
              label: 'Pets',
              description: 'Company pets',
              icon: 'IconCat',
              type: FieldMetadataType.RELATION,
              isCustom: true,
              isSystem: false,
              isUnique: false,
              relationCreationPayload: {
                type: RelationType.MANY_TO_ONE,
                targetObjectMetadataId:
                  PET_FLAT_OBJECT_MOCK.universalIdentifier,
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
            flatApplication: MOCK_FLAT_APPLICATION,
            createFieldInput: {
              name: 'pets',
              label: 'Pets',
              description: 'Company pets',
              icon: 'IconCat',
              type: FieldMetadataType.RELATION,
              isCustom: false,
              isSystem: true,
              isUnique: true,
              relationCreationPayload: {
                type: RelationType.MANY_TO_ONE,
                targetObjectMetadataId:
                  PET_FLAT_OBJECT_MOCK.universalIdentifier,
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
            flatApplication: MOCK_FLAT_APPLICATION,
            morphId: '20202020-9a2b-4c3d-a4e5-f6a7b8c9d0e1',
            createFieldInput: {
              name: 'targetPet',
              label: 'Target Pet',
              description: 'Morph relation to pet',
              icon: 'IconCat',
              type: FieldMetadataType.MORPH_RELATION,
              isCustom: false,
              isSystem: true,
              isUnique: false,
              relationCreationPayload: {
                type: RelationType.MANY_TO_ONE,
                targetObjectMetadataId:
                  PET_FLAT_OBJECT_MOCK.universalIdentifier,
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
            flatApplication: MOCK_FLAT_APPLICATION,
            morphId: '20202020-9a2b-4c3d-a4e5-f6a7b8c9d0e1',
            createFieldInput: {
              name: 'targetPet',
              label: 'Target Pet',
              description: 'Morph relation to pet',
              icon: 'IconCat',
              type: FieldMetadataType.MORPH_RELATION,
              isCustom: false,
              isSystem: true,
              isUnique: false,
              relationCreationPayload: {
                type: RelationType.ONE_TO_MANY,
                targetObjectMetadataId:
                  PET_FLAT_OBJECT_MOCK.universalIdentifier,
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
            flatApplication: MOCK_FLAT_APPLICATION,
            morphId: '20202020-9a2b-4c3d-a4e5-f6a7b8c9d0e1',
            createFieldInput: {
              name: 'targetPet',
              label: 'Target Pet',
              description: 'Morph relation to pet',
              icon: 'IconCat',
              type: FieldMetadataType.RELATION,
              isCustom: false,
              isSystem: true,
              isUnique: false,
              relationCreationPayload: {
                type: RelationType.ONE_TO_MANY,
                targetObjectMetadataId:
                  PET_FLAT_OBJECT_MOCK.universalIdentifier,
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
        expect(sourceFieldMetadata.objectMetadataUniversalIdentifier).toBe(
          input.sourceFlatObjectMetadata.universalIdentifier,
        );
        expect(
          sourceFieldMetadata.relationTargetObjectMetadataUniversalIdentifier,
        ).toBe(input.targetFlatObjectMetadata.universalIdentifier);
        const sourceSettings =
          sourceFieldMetadata.universalSettings as FieldMetadataSettingsMapping['RELATION'];
        const targetSettings =
          targetFieldMetadata.universalSettings as FieldMetadataSettingsMapping['RELATION'];

        expect(sourceSettings.relationType).toBe(expectedSourceRelationType);

        if (shouldSourceHaveMorphId) {
          expect(sourceFieldMetadata.morphId).toBe(input.morphId);
        } else {
          expect(sourceFieldMetadata.morphId).toBeNull();
        }

        expect(targetFieldMetadata.type).toBe(expectedTargetFieldType);
        expect(targetFieldMetadata.objectMetadataUniversalIdentifier).toBe(
          input.targetFlatObjectMetadata.universalIdentifier,
        );
        expect(
          targetFieldMetadata.relationTargetObjectMetadataUniversalIdentifier,
        ).toBe(input.sourceFlatObjectMetadata.universalIdentifier);
        expect(targetSettings.relationType).toBe(expectedTargetRelationType);

        expect(
          sourceFieldMetadata.relationTargetFieldMetadataUniversalIdentifier,
        ).toBe(targetFieldMetadata.universalIdentifier);
        expect(
          targetFieldMetadata.relationTargetFieldMetadataUniversalIdentifier,
        ).toBe(sourceFieldMetadata.universalIdentifier);

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

  describe('Universal identifier behaviour', () => {
    it('should keep the source field universalIdentifier from createFieldInput', () => {
      const sourceUniversalIdentifier = '11111111-2222-3333-4444-555555555555';

      const input: GenerateMorphOrRelationFlatFieldMetadataPairTestInput = {
        sourceFlatObjectMetadata: COMPANY_FLAT_OBJECT_MOCK,
        targetFlatObjectMetadata: PET_FLAT_OBJECT_MOCK,
        targetFlatFieldMetadataType: FieldMetadataType.RELATION,
        sourceFlatObjectMetadataJoinColumnName: 'petId',
        flatApplication: MOCK_FLAT_APPLICATION,
        createFieldInput: {
          name: 'pets',
          label: 'Pets',
          description: 'Company pets',
          icon: 'IconCat',
          type: FieldMetadataType.RELATION,
          isCustom: true,
          isSystem: false,
          isUnique: false,
          universalIdentifier: sourceUniversalIdentifier,
          relationCreationPayload: {
            type: RelationType.ONE_TO_MANY,
            targetObjectMetadataId: PET_FLAT_OBJECT_MOCK.id,
            targetFieldLabel: 'Company',
            targetFieldIcon: 'IconBuildingSkyscraper',
          },
        },
      };

      const result: SourceTargetMorphOrRelationFlatFieldAndFlatIndex =
        generateMorphOrRelationFlatFieldMetadataPair(input);

      const [sourceFieldMetadata, targetFieldMetadata] =
        result.flatFieldMetadatas;

      expect(sourceFieldMetadata.universalIdentifier).toBe(
        sourceUniversalIdentifier,
      );

      expect(targetFieldMetadata.universalIdentifier).toBeDefined();
      expect(targetFieldMetadata.universalIdentifier).not.toBe(
        sourceUniversalIdentifier,
      );
    });
  });
});
