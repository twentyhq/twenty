import { MetadataFlatEntityAndRelatedFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { createEmptyFlatEntityMaps } from '../../constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityAndRelatedEntityMapsOrThrow } from '../add-flat-entity-to-flat-entity-and-related-entity-maps-or-throw.util';

describe('addFlatEntityToFlatEntityAndRelatedEntityMapsOrThrow', () => {
  it('should add a view and update related objectMetadata with viewId', () => {
    const objectMetadataId = 'object-1';
    const viewId = 'view-1';

    const mockObjectMetadata = getFlatObjectMetadataMock({
      id: objectMetadataId,
      universalIdentifier: 'object-universal-1',
      viewIds: [],
      fieldMetadataIds: [],
    });

    const mockView = {
      id: viewId,
      universalIdentifier: 'view-universal-1',
      objectMetadataId: objectMetadataId,
      viewFieldIds: [],
      viewFilterIds: [],
      viewGroupIds: [],
    } as unknown as FlatView;

    const flatEntityAndRelatedMapsToMutate: MetadataFlatEntityAndRelatedFlatEntityMaps<'view'> =
      {
        flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
        flatObjectMetadataMaps: addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: mockObjectMetadata,
          flatEntityMaps: createEmptyFlatEntityMaps(),
        }),
        flatViewMaps: createEmptyFlatEntityMaps(),
      };

    addFlatEntityToFlatEntityAndRelatedEntityMapsOrThrow({
      metadataName: 'view',
      flatEntity: mockView,
      flatEntityAndRelatedMapsToMutate,
    });

    expect(flatEntityAndRelatedMapsToMutate).toMatchInlineSnapshot(`
{
  "flatFieldMetadataMaps": {
    "byId": {},
    "idByUniversalIdentifier": {},
    "universalIdentifiersByApplicationId": {},
  },
  "flatObjectMetadataMaps": {
    "byId": {
      "object-1": {
        "applicationId": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "description": "default flat object metadata description",
        "duplicateCriteria": null,
        "fieldMetadataIds": [],
        "icon": "icon",
        "id": "object-1",
        "imageIdentifierFieldMetadataId": "f08c1ab7-b303-44ee-96a3-c1c99818d0c7",
        "indexMetadataIds": [],
        "isActive": true,
        "isAuditLogged": true,
        "isCustom": true,
        "isLabelSyncedWithName": false,
        "isRemote": false,
        "isSearchable": true,
        "isSystem": false,
        "isUIReadOnly": false,
        "labelIdentifierFieldMetadataId": "e279e9c4-669c-4c53-9cca-ccb1771c8688",
        "labelPlural": "default flat object metadata label plural",
        "labelSingular": "default flat object metadata label singular",
        "namePlural": "defaultflatObjectMetadataNamePlural",
        "nameSingular": "defaultflatObjectMetadataNameSingular",
        "shortcut": "shortcut",
        "standardId": null,
        "standardOverrides": null,
        "targetTableName": "",
        "universalIdentifier": "object-universal-1",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "viewIds": [
          "view-1",
        ],
        "workspaceId": "e25c8a64-020d-405d-be79-3990d6020ced",
      },
    },
    "idByUniversalIdentifier": {
      "object-universal-1": "object-1",
    },
    "universalIdentifiersByApplicationId": {},
  },
  "flatViewMaps": {
    "byId": {
      "view-1": {
        "id": "view-1",
        "objectMetadataId": "object-1",
        "universalIdentifier": "view-universal-1",
        "viewFieldIds": [],
        "viewFilterIds": [],
        "viewGroupIds": [],
      },
    },
    "idByUniversalIdentifier": {
      "view-universal-1": "view-1",
    },
    "universalIdentifiersByApplicationId": {},
  },
}
`);
  });
});
