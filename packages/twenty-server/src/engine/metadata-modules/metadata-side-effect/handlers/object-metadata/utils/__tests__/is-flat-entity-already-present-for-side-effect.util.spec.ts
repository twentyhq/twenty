import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { isFlatEntityAlreadyPresentForSideEffect } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/utils/is-flat-entity-already-present-for-side-effect.util';

const UNIVERSAL_IDENTIFIER = '11111111-1111-4111-8111-111111111111';

const emptyOperationRecord =
  {} as unknown as AllFlatEntityOperationRecordByMetadataName;

describe('isFlatEntityAlreadyPresentForSideEffect', () => {
  it('should return false when the entity is neither pending nor cached', () => {
    const result = isFlatEntityAlreadyPresentForSideEffect({
      metadataName: 'fieldMetadata',
      universalIdentifier: UNIVERSAL_IDENTIFIER,
      allFlatEntityOperationRecordByMetadataName: emptyOperationRecord,
      relatedFlatEntityMaps: {},
    });

    expect(result).toBe(false);
  });

  it('should return true when a matching create is pending in the operation matrix', () => {
    const result = isFlatEntityAlreadyPresentForSideEffect({
      metadataName: 'fieldMetadata',
      universalIdentifier: UNIVERSAL_IDENTIFIER,
      allFlatEntityOperationRecordByMetadataName: {
        fieldMetadata: {
          flatEntityToCreate: {
            [UNIVERSAL_IDENTIFIER]: {
              universalIdentifier: UNIVERSAL_IDENTIFIER,
            },
          },
        },
      } as unknown as AllFlatEntityOperationRecordByMetadataName,
      relatedFlatEntityMaps: {},
    });

    expect(result).toBe(true);
  });

  it('should return true when the entity already exists in the workspace from-state maps', () => {
    const result = isFlatEntityAlreadyPresentForSideEffect({
      metadataName: 'fieldMetadata',
      universalIdentifier: UNIVERSAL_IDENTIFIER,
      allFlatEntityOperationRecordByMetadataName: emptyOperationRecord,
      relatedFlatEntityMaps: {
        flatFieldMetadataMaps: {
          byUniversalIdentifier: {
            [UNIVERSAL_IDENTIFIER]: {
              universalIdentifier: UNIVERSAL_IDENTIFIER,
            },
          },
        },
      },
    });

    expect(result).toBe(true);
  });

  it('should not confuse a different universal identifier as present', () => {
    const result = isFlatEntityAlreadyPresentForSideEffect({
      metadataName: 'fieldMetadata',
      universalIdentifier: UNIVERSAL_IDENTIFIER,
      allFlatEntityOperationRecordByMetadataName: {
        fieldMetadata: {
          flatEntityToCreate: {
            'other-uid': { universalIdentifier: 'other-uid' },
          },
        },
      } as unknown as AllFlatEntityOperationRecordByMetadataName,
      relatedFlatEntityMaps: {
        flatFieldMetadataMaps: {
          byUniversalIdentifier: {
            'other-uid': { universalIdentifier: 'other-uid' },
          },
        },
      },
    });

    expect(result).toBe(false);
  });
});
