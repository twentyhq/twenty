import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { handleIndexChangesDuringFieldUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/handle-index-changes-during-field-update.util';
import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const OBJECT_ID = 'test-object-id';
const FIELD_ID = 'test-field-id';
const APP_ID = 'test-app-id';

const buildFlatObjectMetadata = (indexMetadataIds: string[] = []) =>
  getFlatObjectMetadataMock({
    id: OBJECT_ID,
    universalIdentifier: OBJECT_ID,
    indexMetadataIds,
  });

const buildFlatFieldMetadata = (overrides: Record<string, unknown> = {}) =>
  getFlatFieldMetadataMock({
    id: FIELD_ID,
    universalIdentifier: 'test-field-uid',
    objectMetadataId: OBJECT_ID,
    type: FieldMetadataType.TEXT,
    isUnique: true,
    isCustom: true,
    applicationId: APP_ID,
    ...overrides,
  });

const buildFlatApplication = () => ({
  id: APP_ID,
  universalIdentifier: 'test-app-uid',
});

describe('handleIndexChangesDuringFieldUpdate', () => {
  describe('when toggling isUnique from true to false', () => {
    it('should delete the unique index when name matches (standard path)', () => {
      const fromField = buildFlatFieldMetadata({ isUnique: true });
      const toField = buildFlatFieldMetadata({ isUnique: false });

      const matchingIndex = getFlatIndexMetadataMock({
        universalIdentifier: 'index-uid',
        objectMetadataId: OBJECT_ID,
        objectMetadataUniversalIdentifier: OBJECT_ID,
        applicationUniversalIdentifier: 'test-app-uid',
        isUnique: true,
        isCustom: true,
        applicationId: APP_ID,
        name: 'IDX_UNIQUE_test-object-id_1_test-field-uid',
        flatIndexFieldMetadatas: [
          {
            fieldMetadataId: FIELD_ID,
          } as any,
        ],
      });

      const indexMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: matchingIndex,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      });

      const objectMeta = buildFlatObjectMetadata([matchingIndex.id]);

      const objectMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: objectMeta,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      });

      const fieldMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: fromField,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      });

      const result = handleIndexChangesDuringFieldUpdate({
        fromFlatFieldMetadata: fromField,
        toFlatFieldMetadata: toField,
        flatIndexMaps: indexMaps,
        flatObjectMetadataMaps: objectMaps,
        flatFieldMetadataMaps: fieldMaps,
        flatApplication: buildFlatApplication() as any,
      });

      expect(result.status).toBe('success');

      if (result.status === 'success') {
        expect(result.result.flatIndexMetadatasToDelete).toHaveLength(1);
      }
    });

    it('should delete a legacy-named unique index via the fallback path', () => {
      const fromField = buildFlatFieldMetadata({ isUnique: true });
      const toField = buildFlatFieldMetadata({ isUnique: false });

      const legacyIndex = getFlatIndexMetadataMock({
        universalIdentifier: 'legacy-index-uid',
        objectMetadataId: OBJECT_ID,
        objectMetadataUniversalIdentifier: OBJECT_ID,
        applicationUniversalIdentifier: 'test-app-uid',
        isUnique: true,
        isCustom: true,
        applicationId: APP_ID,
        name: 'LEGACY_OLD_NAME_THAT_DOES_NOT_MATCH',
        flatIndexFieldMetadatas: [
          {
            fieldMetadataId: FIELD_ID,
          } as any,
        ],
      });

      const indexMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: legacyIndex,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      });

      const objectMeta = buildFlatObjectMetadata([legacyIndex.id]);

      const objectMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: objectMeta,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      });

      const fieldMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: fromField,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      });

      const result = handleIndexChangesDuringFieldUpdate({
        fromFlatFieldMetadata: fromField,
        toFlatFieldMetadata: toField,
        flatIndexMaps: indexMaps,
        flatObjectMetadataMaps: objectMaps,
        flatFieldMetadataMaps: fieldMaps,
        flatApplication: buildFlatApplication() as any,
      });

      expect(result.status).toBe('success');

      if (result.status === 'success') {
        expect(result.result.flatIndexMetadatasToDelete).toHaveLength(1);
        expect(result.result.flatIndexMetadatasToDelete[0].name).toBe(
          'LEGACY_OLD_NAME_THAT_DOES_NOT_MATCH',
        );
      }
    });

    it('should NOT delete a composite unique index via the fallback path', () => {
      const fromField = buildFlatFieldMetadata({ isUnique: true });
      const toField = buildFlatFieldMetadata({ isUnique: false });

      const compositeIndex = getFlatIndexMetadataMock({
        universalIdentifier: 'composite-index-uid',
        objectMetadataId: OBJECT_ID,
        objectMetadataUniversalIdentifier: OBJECT_ID,
        applicationUniversalIdentifier: 'test-app-uid',
        isUnique: true,
        isCustom: true,
        applicationId: APP_ID,
        name: 'COMPOSITE_INDEX_NAME',
        flatIndexFieldMetadatas: [
          {
            fieldMetadataId: FIELD_ID,
          } as any,
          {
            fieldMetadataId: 'other-field-id',
          } as any,
        ],
      });

      const indexMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: compositeIndex,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      });

      const objectMeta = buildFlatObjectMetadata([compositeIndex.id]);

      const objectMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: objectMeta,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      });

      const fieldMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: fromField,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      });

      const result = handleIndexChangesDuringFieldUpdate({
        fromFlatFieldMetadata: fromField,
        toFlatFieldMetadata: toField,
        flatIndexMaps: indexMaps,
        flatObjectMetadataMaps: objectMaps,
        flatFieldMetadataMaps: fieldMaps,
        flatApplication: buildFlatApplication() as any,
      });

      expect(result.status).toBe('success');

      if (result.status === 'success') {
        expect(result.result.flatIndexMetadatasToDelete).toHaveLength(0);
      }
    });

    it('should return authorization error for non-custom-app indexes', () => {
      const fromField = buildFlatFieldMetadata({ isUnique: true });
      const toField = buildFlatFieldMetadata({ isUnique: false });

      const nonCustomIndex = getFlatIndexMetadataMock({
        universalIdentifier: 'non-custom-index-uid',
        objectMetadataId: OBJECT_ID,
        objectMetadataUniversalIdentifier: OBJECT_ID,
        applicationUniversalIdentifier: 'test-app-uid',
        isUnique: true,
        isCustom: false,
        applicationId: APP_ID,
        name: 'NON_CUSTOM_INDEX',
        flatIndexFieldMetadatas: [
          {
            fieldMetadataId: FIELD_ID,
          } as any,
        ],
      });

      const indexMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: nonCustomIndex,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      });

      const objectMeta = buildFlatObjectMetadata([nonCustomIndex.id]);

      const objectMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: objectMeta,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      });

      const fieldMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: fromField,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      });

      const result = handleIndexChangesDuringFieldUpdate({
        fromFlatFieldMetadata: fromField,
        toFlatFieldMetadata: toField,
        flatIndexMaps: indexMaps,
        flatObjectMetadataMaps: objectMaps,
        flatFieldMetadataMaps: fieldMaps,
        flatApplication: buildFlatApplication() as any,
      });

      expect(result.status).toBe('fail');

      if (result.status === 'fail') {
        expect(result.errors[0].code).toBe(
          FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        );
      }
    });

    it('should return empty delete list when no matching unique index exists', () => {
      const fromField = buildFlatFieldMetadata({ isUnique: true });
      const toField = buildFlatFieldMetadata({ isUnique: false });

      const nonUniqueIndex = getFlatIndexMetadataMock({
        universalIdentifier: 'non-unique-index-uid',
        objectMetadataId: OBJECT_ID,
        objectMetadataUniversalIdentifier: OBJECT_ID,
        applicationUniversalIdentifier: 'test-app-uid',
        isUnique: false,
        isCustom: true,
        applicationId: APP_ID,
        name: 'SOME_NON_UNIQUE_INDEX',
        flatIndexFieldMetadatas: [
          {
            fieldMetadataId: FIELD_ID,
          } as any,
        ],
      });

      const indexMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: nonUniqueIndex,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      });

      const objectMeta = buildFlatObjectMetadata([nonUniqueIndex.id]);

      const objectMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: objectMeta,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      });

      const fieldMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: fromField,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      });

      const result = handleIndexChangesDuringFieldUpdate({
        fromFlatFieldMetadata: fromField,
        toFlatFieldMetadata: toField,
        flatIndexMaps: indexMaps,
        flatObjectMetadataMaps: objectMaps,
        flatFieldMetadataMaps: fieldMaps,
        flatApplication: buildFlatApplication() as any,
      });

      expect(result.status).toBe('success');

      if (result.status === 'success') {
        expect(result.result.flatIndexMetadatasToDelete).toHaveLength(0);
      }
    });
  });

  describe('when no index-relevant changes', () => {
    it('should return empty side effects', () => {
      const field = buildFlatFieldMetadata({ isUnique: true });

      const result = handleIndexChangesDuringFieldUpdate({
        fromFlatFieldMetadata: field,
        toFlatFieldMetadata: field,
        flatIndexMaps: createEmptyFlatEntityMaps(),
        flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
        flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
        flatApplication: buildFlatApplication() as any,
      });

      expect(result.status).toBe('success');

      if (result.status === 'success') {
        expect(result.result.flatIndexMetadatasToDelete).toHaveLength(0);
        expect(result.result.flatIndexMetadatasToCreate).toHaveLength(0);
        expect(result.result.flatIndexMetadatasToUpdate).toHaveLength(0);
      }
    });
  });
});
