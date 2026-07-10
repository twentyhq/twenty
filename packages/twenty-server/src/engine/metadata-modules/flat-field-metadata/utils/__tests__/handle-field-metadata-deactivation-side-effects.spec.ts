import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { handleFieldMetadataDeactivationSideEffects } from 'src/engine/metadata-modules/flat-field-metadata/utils/handle-field-metadata-deactivation-side-effects.util';

const getFlatView = (id: string): FlatView =>
  ({
    id,
    universalIdentifier: `${id}-universal-identifier`,
    applicationId: 'application-id',
    calendarEndFieldMetadataId: 'calendar-end-field-id',
    calendarEndFieldMetadataUniversalIdentifier:
      'calendar-end-field-universal-identifier',
  }) as FlatView;

describe('handleFieldMetadataDeactivationSideEffects', () => {
  const getEmptyRelatedMaps = () => ({
    flatViewFieldMaps: createEmptyFlatEntityMaps(),
    flatViewFilterMaps: createEmptyFlatEntityMaps(),
    flatViewGroupMaps: createEmptyFlatEntityMaps(),
  });

  it('clears an optional calendar end field without deleting the view', () => {
    const view = getFlatView('calendar-view-id');
    const fromFlatFieldMetadata = getFlatFieldMetadataMock({
      id: 'calendar-end-field-id',
      objectMetadataId: 'object-id',
      universalIdentifier: 'calendar-end-field-universal-identifier',
      type: FieldMetadataType.DATE_TIME,
      calendarEndViewIds: [view.id],
    });

    const result = handleFieldMetadataDeactivationSideEffects({
      fromFlatFieldMetadata,
      toFlatFieldMetadata: {
        ...fromFlatFieldMetadata,
        isActive: false,
      },
      flatViewMaps: addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: view,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      }),
      ...getEmptyRelatedMaps(),
    });

    expect(result.flatViewsToDelete).toEqual([]);
    expect(result.flatViewsToUpdate).toEqual([
      expect.objectContaining({
        id: view.id,
        calendarEndFieldMetadataId: null,
        calendarEndFieldMetadataUniversalIdentifier: null,
      }),
    ]);
  });

  it('deletes the view when the deactivated field is both its start and end field', () => {
    const view = getFlatView('calendar-view-id');
    const fromFlatFieldMetadata = getFlatFieldMetadataMock({
      id: 'calendar-field-id',
      objectMetadataId: 'object-id',
      universalIdentifier: 'calendar-field-universal-identifier',
      type: FieldMetadataType.DATE,
      calendarViewIds: [view.id],
      calendarEndViewIds: [view.id],
    });

    const result = handleFieldMetadataDeactivationSideEffects({
      fromFlatFieldMetadata,
      toFlatFieldMetadata: {
        ...fromFlatFieldMetadata,
        isActive: false,
      },
      flatViewMaps: addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: view,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      }),
      ...getEmptyRelatedMaps(),
    });

    expect(result.flatViewsToDelete).toEqual([view]);
    expect(result.flatViewsToUpdate).toEqual([]);
  });
});
