import { FieldMetadataType, ViewType } from 'twenty-shared/types';

import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { FieldListPinnedViewsOnDeleteSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-list-pinned-views-on-delete-side-effect-handler.service';
import { buildBaseUniversalFlatView } from 'src/engine/metadata-modules/view/utils/build-base-universal-flat-view.util';

const DELETED_FIELD_UNIVERSAL_IDENTIFIER = 'deleted-field';
const KEPT_FIELD_UNIVERSAL_IDENTIFIER = 'kept-field';

const flatViewPinningDeletedField: FlatView = {
  ...buildBaseUniversalFlatView({
    objectMetadataUniversalIdentifier: 'company',
    applicationUniversalIdentifier: 'application',
    universalIdentifier: 'list-view',
    name: 'List',
    key: null,
    icon: 'IconList',
    type: ViewType.LIST,
    position: 0,
    isSystemSideEffect: false,
  }),
  listPinnedFieldUniversalIdentifiers: [
    KEPT_FIELD_UNIVERSAL_IDENTIFIER,
    DELETED_FIELD_UNIVERSAL_IDENTIFIER,
  ],
  workspaceId: 'workspace-id',
  applicationId: 'application-id',
  objectMetadataId: 'company-object-id',
  kanbanAggregateOperationFieldMetadataId: null,
  calendarFieldMetadataId: null,
  calendarEndFieldMetadataId: null,
  mainGroupByFieldMetadataId: null,
  overrides: null,
  viewFieldIds: [],
  viewFieldGroupIds: [],
  viewFilterIds: [],
  viewGroupIds: [],
  viewFilterGroupIds: [],
  navigationMenuItemIds: [],
  viewSortIds: [],
};

const buildSideEffects = (
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName = {},
) => {
  const relatedFlatEntityMaps = createEmptyAllFlatEntityMaps();

  relatedFlatEntityMaps.flatViewMaps.byUniversalIdentifier[
    flatViewPinningDeletedField.universalIdentifier
  ] = flatViewPinningDeletedField;

  return new FieldListPinnedViewsOnDeleteSideEffectHandlerService().buildSideEffects(
    {
      flatEntity: getFlatFieldMetadataMock({
        objectMetadataId: 'company-object-id',
        universalIdentifier: DELETED_FIELD_UNIVERSAL_IDENTIFIER,
        type: FieldMetadataType.DATE_TIME,
      }),
      allFlatEntityOperationRecordByMetadataName,
      relatedFlatEntityMaps,
      context: {
        buildOptions: {
          isSystemBuild: false,
          applicationUniversalIdentifier: 'application',
        },
      },
    },
  );
};

describe('FieldListPinnedViewsOnDeleteSideEffectHandlerService', () => {
  it('unpins the deleted field and keeps the other pinned fields', () => {
    expect(buildSideEffects()).toEqual({
      status: 'success',
      operations: {
        view: {
          flatEntityToUpdate: {
            [flatViewPinningDeletedField.universalIdentifier]: {
              ...flatViewPinningDeletedField,
              listPinnedFieldUniversalIdentifiers: [
                KEPT_FIELD_UNIVERSAL_IDENTIFIER,
              ],
            },
          },
        },
      },
    });
  });

  it('leaves alone a view the same migration deletes', () => {
    expect(
      buildSideEffects({
        view: {
          flatEntityToCreate: {},
          flatEntityToUpdate: {},
          flatEntityToDelete: {
            [flatViewPinningDeletedField.universalIdentifier]:
              flatViewPinningDeletedField,
          },
        },
      }),
    ).toEqual({ status: 'noop' });
  });
});
