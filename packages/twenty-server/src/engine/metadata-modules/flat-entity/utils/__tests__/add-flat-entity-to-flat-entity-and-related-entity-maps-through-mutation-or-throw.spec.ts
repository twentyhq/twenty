import { MetadataFlatEntityAndRelatedFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { FieldMetadataType } from 'twenty-shared/types';
import { createEmptyFlatEntityMaps } from '../../constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow } from '../add-flat-entity-to-flat-entity-and-related-entity-maps-through-mutation-or-throw.util';

describe('addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow', () => {
  it('should add a view and update related objectMetadata with viewId', () => {
    const objectMetadataId = 'object-1';
    const viewId = 'view-1';

    const mockObjectMetadata = getFlatObjectMetadataMock({
      id: objectMetadataId,
      universalIdentifier: 'object-universal-1',
      viewIds: [],
      fieldMetadataIds: [],
      workspaceId: '20202020-bc64-4148-8a79-b3144f743694',
      imageIdentifierFieldMetadataId: '20202020-9d65-415f-b0e1-216a2e257ea4',
      labelIdentifierFieldMetadataId: '20202020-1a62-405c-87fa-4d4fd215851b',
    });

    const mockFieldMEtadata = getFlatFieldMetadataMock({
      objectMetadataId,
      type: FieldMetadataType.DATE,
      universalIdentifier: 'field-universal-1',
      viewFieldIds: [],
      viewGroupIds: [],
      viewFilterIds: [],
      calendarViewIds: [],
    });

    const mockView: Partial<FlatView> = {
      id: viewId,
      universalIdentifier: 'view-universal-1',
      objectMetadataId: objectMetadataId,
      viewFieldIds: [],
      viewFilterIds: [],
      viewGroupIds: [],
      calendarFieldMetadataId: mockFieldMEtadata.id,
    };

    const flatEntityAndRelatedMapsToMutate: MetadataFlatEntityAndRelatedFlatEntityMaps<'view'> =
      {
        flatFieldMetadataMaps: addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: mockFieldMEtadata,
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

    expect(flatEntityAndRelatedMapsToMutate).toMatchSnapshot();
    expect(
      flatEntityAndRelatedMapsToMutate.flatObjectMetadataMaps.byId[
        objectMetadataId
      ],
    ).toMatchObject<Partial<FlatObjectMetadata>>({
      viewIds: [mockView.id!],
    });

    expect(
      flatEntityAndRelatedMapsToMutate.flatFieldMetadataMaps.byId[
        mockFieldMEtadata.id
      ],
    ).toMatchObject<Partial<FlatFieldMetadata>>({
      calendarViewIds: [mockView.id!],
    });
  });
});
