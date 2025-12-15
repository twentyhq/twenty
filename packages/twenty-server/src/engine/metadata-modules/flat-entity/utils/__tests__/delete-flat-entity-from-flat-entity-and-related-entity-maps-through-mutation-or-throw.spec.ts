import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type MetadataFlatEntityAndRelatedFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityAndRelatedEntityMapsThroughMutationOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/delete-flat-entity-from-flat-entity-and-related-entity-maps-through-mutation-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

describe('deleteFlatEntityFromFlatEntityAndRelatedEntityMapsThroughMutationOrThrow', () => {
  it('should delete a view and update related objectMetadata and fieldMetadata by removing viewId', () => {
    const objectMetadataId = 'object-1';
    const viewId = 'view-1';
    const applicationId = '20202020-f3ad-452e-b5b6-2d49d3ea88b1';
    const workspaceId = '20202020-bc64-4148-8a79-b3144f743694';

    const mockObjectMetadata = getFlatObjectMetadataMock({
      id: objectMetadataId,
      universalIdentifier: 'object-universal-1',
      viewIds: [viewId, 'something-else'],
      fieldMetadataIds: [],
      workspaceId,
      imageIdentifierFieldMetadataId: '20202020-9d65-415f-b0e1-216a2e257ea4',
      labelIdentifierFieldMetadataId: '20202020-1a62-405c-87fa-4d4fd215851b',
      applicationId,
    });

    const mockFieldMetadata = getFlatFieldMetadataMock({
      objectMetadataId,
      id: '20202020-4087-423b-852a-91f91acf2df2',
      type: FieldMetadataType.DATE,
      universalIdentifier: 'field-universal-1',
      viewFieldIds: [],
      viewFilterIds: [],
      workspaceId,
      calendarViewIds: [viewId],
      mainGroupByFieldMetadataViewIds: [],
      applicationId,
    });

    const mockView: Partial<FlatView> = {
      id: viewId,
      universalIdentifier: 'view-universal-1',
      objectMetadataId: objectMetadataId,
      viewFieldIds: [],
      viewFilterIds: [],
      viewGroupIds: [],
      workspaceId,
      calendarFieldMetadataId: mockFieldMetadata.id,
      createdAt: new Date('2024-01-01').toISOString(),
      updatedAt: new Date('2024-01-01').toISOString(),
      icon: 'icon',
      isCompact: false,
      name: 'View Name',
      position: 0,
      applicationId,
    };

    const flatEntityAndRelatedMapsToMutate: MetadataFlatEntityAndRelatedFlatEntityMaps<'view'> =
      {
        flatFieldMetadataMaps: addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: mockFieldMetadata,
          flatEntityMaps: createEmptyFlatEntityMaps(),
        }),
        flatObjectMetadataMaps: addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: mockObjectMetadata,
          flatEntityMaps: createEmptyFlatEntityMaps(),
        }),
        flatViewMaps: addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: mockView as FlatView,
          flatEntityMaps: createEmptyFlatEntityMaps(),
        }),
      };

    deleteFlatEntityFromFlatEntityAndRelatedEntityMapsThroughMutationOrThrow({
      metadataName: 'view',
      flatEntity: mockView as FlatView,
      flatEntityAndRelatedMapsToMutate,
    });

    expect(
      flatEntityAndRelatedMapsToMutate.flatViewMaps.byId[viewId],
    ).toBeUndefined();

    expect(
      flatEntityAndRelatedMapsToMutate.flatObjectMetadataMaps.byId[
        objectMetadataId
      ],
    ).toMatchObject<Partial<FlatObjectMetadata>>({
      viewIds: ['something-else'],
    });

    expect(
      flatEntityAndRelatedMapsToMutate.flatFieldMetadataMaps.byId[
        mockFieldMetadata.id
      ],
    ).toMatchObject<Partial<FlatFieldMetadata>>({
      calendarViewIds: [],
    });
  });
});
