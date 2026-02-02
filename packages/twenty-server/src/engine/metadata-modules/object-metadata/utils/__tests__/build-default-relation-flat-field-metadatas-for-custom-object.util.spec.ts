import camelCase from 'lodash.camelcase';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { ATTACHMENT_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/attachment-flat-object.mock';
import { FAVORITE_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/favorite-flat-object.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { NOTE_TARGET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/note-target-flat-object.mock';
import { TASK_TARGET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/task-target-flat-object.mock';
import { TIMELINE_ACTIVITY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/timeline-activity-flat-object.mock';
import { buildDefaultRelationFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-relation-flat-field-metadatas-for-custom-object.util';

const MOCK_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const MOCK_FLAT_APPLICATION: FlatApplication = {
  id: '20202020-81ee-42da-a281-668632f32fe7',
  universalIdentifier: '20202020-81ee-42da-a281-668632f32fe7',
  workspaceId: MOCK_WORKSPACE_ID,
  name: 'Workspace Custom Application',
  description: null,
  version: null,
  sourceType: 'local',
  sourcePath: '',
  logicFunctionLayerId: null,
  defaultRoleId: null,
  defaultRole: null,
  canBeUninstalled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

// Standard objects required for relation fields
const STANDARD_FLAT_OBJECT_MOCKS = [
  TIMELINE_ACTIVITY_FLAT_OBJECT_MOCK,
  FAVORITE_FLAT_OBJECT_MOCK,
  ATTACHMENT_FLAT_OBJECT_MOCK,
  NOTE_TARGET_FLAT_OBJECT_MOCK,
  TASK_TARGET_FLAT_OBJECT_MOCK,
];

const createFlatObjectMetadataMaps = (
  additionalObjects: ReturnType<typeof getFlatObjectMetadataMock>[] = [],
) => {
  return [...STANDARD_FLAT_OBJECT_MOCKS, ...additionalObjects].reduce(
    (flatObjectMaps, flatObjectMetadata) =>
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: flatObjectMetadata,
        flatEntityMaps: flatObjectMaps,
      }),
    createEmptyFlatEntityMaps(),
  );
};

describe('buildDefaultRelationFlatFieldMetadatasForCustomObject', () => {
  // Feature flags that enable morph relations with "target" prefix
  const featureFlagsForMorphRelations: FeatureFlagMap = {
    [FeatureFlagKey.IS_TIMELINE_ACTIVITY_MIGRATED]: true,
    [FeatureFlagKey.IS_ATTACHMENT_MIGRATED]: true,
  } as FeatureFlagMap;

  describe('morph field name generation for short acronym object names', () => {
    it('should generate lodash-idempotent field names for objects with short acronym names like "mA" (from M&A)', () => {
      // Object named "mA" (from label "M&A")
      const mAFlatObjectMock = getFlatObjectMetadataMock({
        id: '11111111-1111-1111-1111-111111111111',
        nameSingular: 'mA',
        namePlural: 'mAs',
        labelSingular: 'M&A',
        labelPlural: 'M&As',
        universalIdentifier: '11111111-1111-1111-1111-111111111111',
        workspaceId: MOCK_WORKSPACE_ID,
        applicationId: MOCK_FLAT_APPLICATION.id,
      });

      const result = buildDefaultRelationFlatFieldMetadatasForCustomObject({
        existingFeatureFlagsMap: featureFlagsForMorphRelations,
        existingFlatObjectMetadataMaps: createFlatObjectMetadataMaps([
          mAFlatObjectMock,
        ]),
        sourceFlatObjectMetadata: mAFlatObjectMock,
        workspaceId: MOCK_WORKSPACE_ID,
        flatApplication: MOCK_FLAT_APPLICATION,
      });

      const targetFieldNames = result.standardTargetFlatFieldMetadatas.map(
        (field) => field.name,
      );

      // All generated field names should be lodash-idempotent
      for (const fieldName of targetFieldNames) {
        expect(camelCase(fieldName)).toBe(fieldName);
      }

      // Specifically, "targetMa" should be generated (not "targetMA")
      // because camelCase("targetMA") returns "targetMa"
      expect(targetFieldNames).toContain('targetMa');
    });

    it('should generate correct field names for regular camelCase object names', () => {
      const petCareAgreementFlatObjectMock = getFlatObjectMetadataMock({
        id: '22222222-2222-2222-2222-222222222222',
        nameSingular: 'petCareAgreement',
        namePlural: 'petCareAgreements',
        labelSingular: 'Pet Care Agreement',
        labelPlural: 'Pet Care Agreements',
        universalIdentifier: '22222222-2222-2222-2222-222222222222',
        workspaceId: MOCK_WORKSPACE_ID,
        applicationId: MOCK_FLAT_APPLICATION.id,
      });

      const result = buildDefaultRelationFlatFieldMetadatasForCustomObject({
        existingFeatureFlagsMap: featureFlagsForMorphRelations,
        existingFlatObjectMetadataMaps: createFlatObjectMetadataMaps([
          petCareAgreementFlatObjectMock,
        ]),
        sourceFlatObjectMetadata: petCareAgreementFlatObjectMock,
        workspaceId: MOCK_WORKSPACE_ID,
        flatApplication: MOCK_FLAT_APPLICATION,
      });

      const targetFieldNames = result.standardTargetFlatFieldMetadatas.map(
        (field) => field.name,
      );

      // All generated field names should be lodash-idempotent
      for (const fieldName of targetFieldNames) {
        expect(camelCase(fieldName)).toBe(fieldName);
      }

      expect(targetFieldNames).toContain('targetPetCareAgreement');
    });
  });
});
