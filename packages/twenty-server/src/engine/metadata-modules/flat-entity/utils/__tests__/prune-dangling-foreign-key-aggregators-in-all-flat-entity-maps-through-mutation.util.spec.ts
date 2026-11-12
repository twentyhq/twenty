import { DEFAULT_VIEW_GROUP_LOAD_LIMIT } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';

import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { pruneDanglingForeignKeyAggregatorsInAllFlatEntityMapsThroughMutation } from 'src/engine/metadata-modules/flat-entity/utils/prune-dangling-foreign-key-aggregators-in-all-flat-entity-maps-through-mutation.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

const buildFlatViewField = (universalIdentifier: string): FlatViewField =>
  ({
    id: universalIdentifier,
    universalIdentifier,
  }) as FlatViewField;

const buildFlatView = ({
  universalIdentifier,
  viewFieldUniversalIdentifiers,
}: {
  universalIdentifier: string;
  viewFieldUniversalIdentifiers: string[];
}): FlatView => ({
  id: universalIdentifier,
  universalIdentifier,
  workspaceId: 'workspace-id',
  applicationId: 'application-id',
  applicationUniversalIdentifier: 'application-universal-identifier',
  objectMetadataId: 'object-metadata-id',
  name: 'Body',
  icon: 'IconUser',
  type: ViewType.TABLE,
  key: null,
  position: 0,
  isCompact: false,
  openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
  kanbanAggregateOperation: null,
  kanbanAggregateOperationFieldMetadataId: null,
  calendarLayout: null,
  calendarFieldMetadataId: null,
  calendarEndFieldMetadataId: null,
  mainGroupByFieldMetadataId: null,
  shouldHideEmptyGroups: false,
  shouldDisplayGroupsAsTabs: false,
  kanbanColumnWidth: null,
  groupLoadLimit: DEFAULT_VIEW_GROUP_LOAD_LIMIT,
  anyFieldFilterValue: null,
  visibility: ViewVisibility.WORKSPACE,
  isActive: true,
  isSystemSideEffect: false,
  createdByUserWorkspaceId: null,
  overrides: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
  viewFieldIds: [],
  viewFieldGroupIds: [],
  viewFilterIds: [],
  viewFilterGroupIds: [],
  viewSortIds: [],
  viewGroupIds: [],
  navigationMenuItemIds: [],
  viewFieldUniversalIdentifiers,
  viewFieldGroupUniversalIdentifiers: [],
  viewFilterUniversalIdentifiers: [],
  viewFilterGroupUniversalIdentifiers: [],
  viewSortUniversalIdentifiers: [],
  viewGroupUniversalIdentifiers: [],
  navigationMenuItemUniversalIdentifiers: [],
  objectMetadataUniversalIdentifier: 'object-metadata-universal-identifier',
  kanbanAggregateOperationFieldMetadataUniversalIdentifier: null,
  calendarFieldMetadataUniversalIdentifier: null,
  calendarEndFieldMetadataUniversalIdentifier: null,
  mainGroupByFieldMetadataUniversalIdentifier: null,
  universalOverrides: null,
});

const buildAllFlatEntityMapsWithView = ({
  view,
  viewFields,
}: {
  view: FlatView;
  viewFields: FlatViewField[];
}): AllFlatEntityMaps => {
  const allFlatEntityMaps = createEmptyAllFlatEntityMaps();

  allFlatEntityMaps.flatViewMaps.byUniversalIdentifier[
    view.universalIdentifier
  ] = view;

  for (const viewField of viewFields) {
    allFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier[
      viewField.universalIdentifier
    ] = viewField;
  }

  return allFlatEntityMaps;
};

describe('pruneDanglingForeignKeyAggregatorsInAllFlatEntityMapsThroughMutation', () => {
  it('should drop references to children missing from the slice while keeping present ones', () => {
    const view = buildFlatView({
      universalIdentifier: 'view-body',
      viewFieldUniversalIdentifiers: ['vf-arm', 'vf-head', 'vf-leg'],
    });

    // vf-leg is owned by another application and therefore not part of the slice
    const allFlatEntityMaps = buildAllFlatEntityMapsWithView({
      view,
      viewFields: [buildFlatViewField('vf-arm'), buildFlatViewField('vf-head')],
    });

    pruneDanglingForeignKeyAggregatorsInAllFlatEntityMapsThroughMutation({
      allFlatEntityMapsToMutate: allFlatEntityMaps,
    });

    expect(
      allFlatEntityMaps.flatViewMaps.byUniversalIdentifier['view-body']
        ?.viewFieldUniversalIdentifiers,
    ).toEqual(['vf-arm', 'vf-head']);
  });

  it('should leave aggregators untouched when every reference is present in the slice', () => {
    const view = buildFlatView({
      universalIdentifier: 'view-body',
      viewFieldUniversalIdentifiers: ['vf-arm', 'vf-head'],
    });

    const allFlatEntityMaps = buildAllFlatEntityMapsWithView({
      view,
      viewFields: [buildFlatViewField('vf-arm'), buildFlatViewField('vf-head')],
    });

    pruneDanglingForeignKeyAggregatorsInAllFlatEntityMapsThroughMutation({
      allFlatEntityMapsToMutate: allFlatEntityMaps,
    });

    const prunedView =
      allFlatEntityMaps.flatViewMaps.byUniversalIdentifier['view-body'];

    expect(prunedView?.viewFieldUniversalIdentifiers).toEqual([
      'vf-arm',
      'vf-head',
    ]);
    // No dangling reference means the entity reference is preserved as-is
    expect(prunedView).toBe(view);
  });

  it('should drop all references when no children remain in the slice', () => {
    const view = buildFlatView({
      universalIdentifier: 'view-body',
      viewFieldUniversalIdentifiers: ['vf-arm', 'vf-head'],
    });

    const allFlatEntityMaps = buildAllFlatEntityMapsWithView({
      view,
      viewFields: [],
    });

    pruneDanglingForeignKeyAggregatorsInAllFlatEntityMapsThroughMutation({
      allFlatEntityMapsToMutate: allFlatEntityMaps,
    });

    expect(
      allFlatEntityMaps.flatViewMaps.byUniversalIdentifier['view-body']
        ?.viewFieldUniversalIdentifiers,
    ).toEqual([]);
  });

  it('should prune dangling references generically across entity types (objectMetadata fields)', () => {
    const allFlatEntityMaps = createEmptyAllFlatEntityMaps();

    allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier['object-1'] =
      getFlatObjectMetadataMock({
        id: 'object-1',
        universalIdentifier: 'object-1',
        fieldUniversalIdentifiers: ['field-present', 'field-missing'],
        viewUniversalIdentifiers: [],
        indexMetadataUniversalIdentifiers: [],
        objectPermissionUniversalIdentifiers: [],
        fieldPermissionUniversalIdentifiers: [],
      });

    allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
      'field-present'
    ] = getFlatFieldMetadataMock({
      id: 'field-present',
      universalIdentifier: 'field-present',
      objectMetadataId: 'object-1',
      type: FieldMetadataType.TEXT,
    });

    pruneDanglingForeignKeyAggregatorsInAllFlatEntityMapsThroughMutation({
      allFlatEntityMapsToMutate: allFlatEntityMaps,
    });

    expect(
      allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier['object-1']
        ?.fieldUniversalIdentifiers,
    ).toEqual(['field-present']);
  });

  it('should not mutate the shared parent entity object when pruning', () => {
    const view = buildFlatView({
      universalIdentifier: 'view-body',
      viewFieldUniversalIdentifiers: ['vf-arm', 'vf-leg'],
    });

    const allFlatEntityMaps = buildAllFlatEntityMapsWithView({
      view,
      viewFields: [buildFlatViewField('vf-arm')],
    });

    pruneDanglingForeignKeyAggregatorsInAllFlatEntityMapsThroughMutation({
      allFlatEntityMapsToMutate: allFlatEntityMaps,
    });

    // The map entry is swapped for a new pruned object, leaving the original
    // (shared with other slices/cache) entity untouched
    expect(view.viewFieldUniversalIdentifiers).toEqual(['vf-arm', 'vf-leg']);
    expect(
      allFlatEntityMaps.flatViewMaps.byUniversalIdentifier['view-body'],
    ).not.toBe(view);
    expect(
      allFlatEntityMaps.flatViewMaps.byUniversalIdentifier['view-body']
        ?.viewFieldUniversalIdentifiers,
    ).toEqual(['vf-arm']);
  });
});
