import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { computeFlatFieldToUpdateAndRelatedFlatFieldToUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/compute-flat-field-to-update-and-related-flat-field-to-update.util';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const STANDARD = TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER;

const buildRelationPair = (applicationUniversalIdentifier: string) => {
  const flatObjectMetadata = getFlatObjectMetadataMock({
    universalIdentifier: 'object-uid',
    id: 'object-id',
    applicationUniversalIdentifier,
  });
  const sourceFlatFieldMetadata = getFlatFieldMetadataMock({
    universalIdentifier: 'source-uid',
    id: 'source-id',
    objectMetadataId: flatObjectMetadata.id,
    type: FieldMetadataType.RELATION,
    relationTargetFieldMetadataId: 'target-id',
    applicationUniversalIdentifier,
  });
  const targetFlatFieldMetadata = getFlatFieldMetadataMock({
    universalIdentifier: 'target-uid',
    id: 'target-id',
    objectMetadataId: 'other-object-id',
    type: FieldMetadataType.RELATION,
    relationTargetFieldMetadataId: sourceFlatFieldMetadata.id,
    applicationUniversalIdentifier,
  });
  const flatFieldMetadataMaps = [
    sourceFlatFieldMetadata,
    targetFlatFieldMetadata,
  ].reduce(
    (maps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity,
        flatEntityMaps: maps,
      }),
    createEmptyFlatEntityMaps(),
  );

  return { flatObjectMetadata, sourceFlatFieldMetadata, flatFieldMetadataMaps };
};

describe('computeFlatFieldToUpdateAndRelatedFlatFieldToUpdate', () => {
  it('dispatches a standard relation deactivation into both sides overrides', () => {
    const {
      flatObjectMetadata,
      sourceFlatFieldMetadata,
      flatFieldMetadataMaps,
    } = buildRelationPair(STANDARD);

    const { flatFieldMetadataFromTo, relatedFlatFieldMetadatasFromTo } =
      computeFlatFieldToUpdateAndRelatedFlatFieldToUpdate({
        rawUpdateFieldInput: {
          id: sourceFlatFieldMetadata.id,
          workspaceId: 'workspace-id',
          isActive: false,
        },
        fromFlatFieldMetadata: sourceFlatFieldMetadata,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        isSystemBuild: false,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      });

    expect(flatFieldMetadataFromTo.toFlatFieldMetadata).toMatchObject({
      isActive: true,
      overrides: { [CUSTOM]: { isActive: false } },
    });
    expect(relatedFlatFieldMetadatasFromTo).toHaveLength(1);
    expect(
      relatedFlatFieldMetadatasFromTo[0].toFlatFieldMetadata,
    ).toMatchObject({
      id: 'target-id',
      isActive: true,
      overrides: { [CUSTOM]: { isActive: false } },
    });
  });

  it('writes the column on both sides of a custom relation', () => {
    const {
      flatObjectMetadata,
      sourceFlatFieldMetadata,
      flatFieldMetadataMaps,
    } = buildRelationPair(CUSTOM);

    const { flatFieldMetadataFromTo, relatedFlatFieldMetadatasFromTo } =
      computeFlatFieldToUpdateAndRelatedFlatFieldToUpdate({
        rawUpdateFieldInput: {
          id: sourceFlatFieldMetadata.id,
          workspaceId: 'workspace-id',
          isActive: false,
        },
        fromFlatFieldMetadata: sourceFlatFieldMetadata,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        isSystemBuild: false,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      });

    expect(flatFieldMetadataFromTo.toFlatFieldMetadata).toMatchObject({
      isActive: false,
      overrides: null,
    });
    expect(
      relatedFlatFieldMetadatasFromTo[0].toFlatFieldMetadata,
    ).toMatchObject({ id: 'target-id', isActive: false, overrides: null });
  });

  it('writes the column on both sides of a standard relation in a system build', () => {
    const {
      flatObjectMetadata,
      sourceFlatFieldMetadata,
      flatFieldMetadataMaps,
    } = buildRelationPair(STANDARD);

    const { flatFieldMetadataFromTo, relatedFlatFieldMetadatasFromTo } =
      computeFlatFieldToUpdateAndRelatedFlatFieldToUpdate({
        rawUpdateFieldInput: {
          id: sourceFlatFieldMetadata.id,
          workspaceId: 'workspace-id',
          isActive: false,
        },
        fromFlatFieldMetadata: sourceFlatFieldMetadata,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        isSystemBuild: true,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      });

    expect(flatFieldMetadataFromTo.toFlatFieldMetadata).toMatchObject({
      isActive: false,
      overrides: null,
    });
    expect(
      relatedFlatFieldMetadatasFromTo[0].toFlatFieldMetadata,
    ).toMatchObject({ id: 'target-id', isActive: false, overrides: null });
  });

  it('leaves the related field untouched when isActive is not updated', () => {
    const {
      flatObjectMetadata,
      sourceFlatFieldMetadata,
      flatFieldMetadataMaps,
    } = buildRelationPair(STANDARD);

    const { relatedFlatFieldMetadatasFromTo } =
      computeFlatFieldToUpdateAndRelatedFlatFieldToUpdate({
        rawUpdateFieldInput: {
          id: sourceFlatFieldMetadata.id,
          workspaceId: 'workspace-id',
          label: 'Renamed',
        },
        fromFlatFieldMetadata: sourceFlatFieldMetadata,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        isSystemBuild: false,
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
      });

    expect(relatedFlatFieldMetadatasFromTo[0].toFlatFieldMetadata).toEqual(
      relatedFlatFieldMetadatasFromTo[0].fromFlatFieldMetadata,
    );
  });
});
