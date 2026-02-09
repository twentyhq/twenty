import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type MetadataFlatEntityAndRelatedFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';
import { addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-and-related-entity-maps-through-mutation-or-throw.util';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

describe('addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow', () => {
  it('should add a view and update related objectMetadata and fieldMetadata with both id and universal identifier aggregators', () => {
    const objectMetadataId = 'object-1';
    const viewId = 'view-1';
    const applicationId = '20202020-f3ad-452e-b5b6-2d49d3ea88b1';
    const workspaceId = '20202020-bc64-4148-8a79-b3144f743694';
    const objectUniversalIdentifier = 'object-universal-1';
    const fieldUniversalIdentifier = 'field-universal-1';
    const viewUniversalIdentifier = 'view-universal-1';

    const mockObjectMetadata = getFlatObjectMetadataMock({
      id: objectMetadataId,
      universalIdentifier: objectUniversalIdentifier,
      viewIds: [],
      fieldIds: [],
      workspaceId,
      imageIdentifierFieldMetadataId: '20202020-9d65-415f-b0e1-216a2e257ea4',
      labelIdentifierFieldMetadataId: '20202020-1a62-405c-87fa-4d4fd215851b',
      applicationId,
    });

    const mockFieldMetadata = getFlatFieldMetadataMock({
      objectMetadataId,
      id: '202020-71a3-4856-a3d0-d08cea0ecec6',
      type: FieldMetadataType.DATE,
      workspaceId,
      applicationId,
      universalIdentifier: fieldUniversalIdentifier,
      viewFieldIds: [],
      viewFilterIds: [],
      calendarViewIds: [],
      mainGroupByFieldMetadataViewIds: [],
    });

    const mockView: Pick<FlatView, 'id'> & Partial<FlatView> = {
      id: viewId,
      workspaceId,
      universalIdentifier: viewUniversalIdentifier,
      objectMetadataId: objectMetadataId,
      objectMetadataUniversalIdentifier: objectUniversalIdentifier,
      viewFieldIds: [],
      viewFilterIds: [],
      viewGroupIds: [],
      applicationId,
      calendarFieldMetadataId: mockFieldMetadata.id,
      calendarFieldMetadataUniversalIdentifier: fieldUniversalIdentifier,
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
        flatViewMaps: createEmptyFlatEntityMaps(),
      };

    addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow({
      metadataName: 'view',
      flatEntity: mockView as FlatView,
      flatEntityAndRelatedMapsToMutate,
    });

    expect(
      findFlatEntityByUniversalIdentifier({
        universalIdentifier: viewUniversalIdentifier,
        flatEntityMaps: flatEntityAndRelatedMapsToMutate.flatViewMaps,
      }),
    ).toMatchObject(mockView);

    expect(
      findFlatEntityByUniversalIdentifier({
        universalIdentifier: objectUniversalIdentifier,
        flatEntityMaps: flatEntityAndRelatedMapsToMutate.flatObjectMetadataMaps,
      }),
    ).toMatchObject<Partial<FlatObjectMetadata>>({
      viewIds: [mockView.id],
      viewUniversalIdentifiers: [viewUniversalIdentifier],
    });

    expect(
      findFlatEntityByUniversalIdentifier({
        universalIdentifier: fieldUniversalIdentifier,
        flatEntityMaps: flatEntityAndRelatedMapsToMutate.flatFieldMetadataMaps,
      }),
    ).toMatchObject<Partial<FlatFieldMetadata>>({
      calendarViewIds: [mockView.id],
      calendarViewUniversalIdentifiers: [viewUniversalIdentifier],
    });
  });
});
