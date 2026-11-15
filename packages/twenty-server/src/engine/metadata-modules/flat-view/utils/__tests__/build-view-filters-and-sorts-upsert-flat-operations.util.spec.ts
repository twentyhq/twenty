import {
  FieldMetadataType,
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewSortDirection,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type FlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort.type';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { buildViewFiltersAndSortsUpsertFlatOperations } from 'src/engine/metadata-modules/flat-view/utils/build-view-filters-and-sorts-upsert-flat-operations.util';

const APPLICATION_UNIVERSAL_IDENTIFIER = '20202020-aaaa-4aaa-8aaa-000000000001';
const VIEW_ID = '20202020-bbbb-4bbb-8bbb-000000000002';
const VIEW_UNIVERSAL_IDENTIFIER = '20202020-bbbb-4bbb-8bbb-000000000003';
const NAME_FIELD_ID = '20202020-cccc-4ccc-8ccc-000000000004';
const GROUP_ID = '20202020-dddd-4ddd-8ddd-000000000005';
const NEW_FILTER_ID = '20202020-eeee-4eee-8eee-000000000006';
const KEPT_FILTER_ID = '20202020-eeee-4eee-8eee-000000000007';
const REMOVED_FILTER_ID = '20202020-eeee-4eee-8eee-000000000008';
const REMOVED_SORT_ID = '20202020-ffff-4fff-8fff-000000000009';
const NOW = '2026-11-15T00:00:00.000Z';

const flatFieldMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: getFlatFieldMetadataMock({
    id: NAME_FIELD_ID,
    universalIdentifier: NAME_FIELD_ID,
    objectMetadataId: '20202020-0000-4000-8000-000000000010',
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    type: FieldMetadataType.TEXT,
  }),
  flatEntityMaps:
    createEmptyFlatEntityMaps() as FlatEntityMaps<FlatFieldMetadata>,
});

// The view is created by the same migration, so only its universal identifier is known
const flatViewMaps: FlatViewMaps = {
  ...createEmptyFlatEntityMaps(),
  universalIdentifierById: { [VIEW_ID]: VIEW_UNIVERSAL_IDENTIFIER },
};

const buildExistingFlatViewFilter = (id: string): FlatViewFilter => ({
  id,
  universalIdentifier: id,
  workspaceId: 'workspace-id',
  applicationId: 'application-id',
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  fieldMetadataId: NAME_FIELD_ID,
  fieldMetadataUniversalIdentifier: NAME_FIELD_ID,
  viewId: VIEW_ID,
  viewUniversalIdentifier: VIEW_UNIVERSAL_IDENTIFIER,
  operand: ViewFilterOperand.CONTAINS,
  value: 'acme',
  viewFilterGroupId: null,
  viewFilterGroupUniversalIdentifier: null,
  positionInViewFilterGroup: null,
  subFieldName: null,
  relationTargetFieldMetadataId: null,
  relationTargetFieldMetadataUniversalIdentifier: null,
  createdAt: NOW,
  updatedAt: NOW,
  deletedAt: null,
});

const existingFlatViewSort: FlatViewSort = {
  id: REMOVED_SORT_ID,
  universalIdentifier: REMOVED_SORT_ID,
  workspaceId: 'workspace-id',
  applicationId: 'application-id',
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  fieldMetadataId: NAME_FIELD_ID,
  fieldMetadataUniversalIdentifier: NAME_FIELD_ID,
  viewId: VIEW_ID,
  viewUniversalIdentifier: VIEW_UNIVERSAL_IDENTIFIER,
  direction: ViewSortDirection.ASC,
  createdAt: NOW,
  updatedAt: NOW,
  deletedAt: null,
};

const flatViewFilterMaps = [
  buildExistingFlatViewFilter(KEPT_FILTER_ID),
  buildExistingFlatViewFilter(REMOVED_FILTER_ID),
].reduce<FlatEntityMaps<FlatViewFilter>>(
  (flatEntityMaps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
  createEmptyFlatEntityMaps(),
);

const flatViewSortMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: existingFlatViewSort,
  flatEntityMaps: createEmptyFlatEntityMaps() as FlatEntityMaps<FlatViewSort>,
});

const baseArgs = {
  viewId: VIEW_ID,
  workspaceId: 'workspace-id',
  applicationId: 'application-id',
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  now: NOW,
  flatFieldMetadataMaps,
  flatViewMaps,
  flatViewFilterMaps,
  flatViewFilterGroupMaps: createEmptyFlatEntityMaps(),
  flatViewSortMaps,
};

describe('buildViewFiltersAndSortsUpsertFlatOperations', () => {
  it('creates new children, updates changed ones and removes missing ones', () => {
    const { viewFilterGroup, viewFilter, viewSort } =
      buildViewFiltersAndSortsUpsertFlatOperations({
        ...baseArgs,
        viewFilterGroups: [
          { id: GROUP_ID, logicalOperator: ViewFilterGroupLogicalOperator.OR },
        ],
        viewFilters: [
          {
            id: NEW_FILTER_ID,
            fieldMetadataId: NAME_FIELD_ID,
            operand: ViewFilterOperand.IS,
            value: 'globex',
            viewFilterGroupId: GROUP_ID,
          },
          {
            id: KEPT_FILTER_ID,
            fieldMetadataId: NAME_FIELD_ID,
            operand: ViewFilterOperand.CONTAINS,
            value: 'initech',
          },
        ],
        viewSorts: [],
      });

    expect(viewFilterGroup.flatEntityToCreate).toEqual([
      expect.objectContaining({
        id: GROUP_ID,
        viewUniversalIdentifier: VIEW_UNIVERSAL_IDENTIFIER,
        logicalOperator: ViewFilterGroupLogicalOperator.OR,
      }),
    ]);
    expect(viewFilter.flatEntityToCreate).toEqual([
      expect.objectContaining({
        id: NEW_FILTER_ID,
        viewFilterGroupId: GROUP_ID,
        viewFilterGroupUniversalIdentifier: GROUP_ID,
      }),
    ]);
    expect(viewFilter.flatEntityToUpdate).toEqual([
      expect.objectContaining({ id: KEPT_FILTER_ID, value: 'initech' }),
    ]);
    expect(viewFilter.flatEntityToDelete).toEqual([
      expect.objectContaining({ id: REMOVED_FILTER_ID }),
    ]);
    expect(viewSort.flatEntityToDelete).toEqual([
      expect.objectContaining({ id: REMOVED_SORT_ID }),
    ]);
  });

  it('clears the group of a filter sent with a null group', () => {
    const { viewFilter } = buildViewFiltersAndSortsUpsertFlatOperations({
      ...baseArgs,
      flatViewFilterMaps: addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: {
          ...buildExistingFlatViewFilter(KEPT_FILTER_ID),
          viewFilterGroupId: GROUP_ID,
          viewFilterGroupUniversalIdentifier: GROUP_ID,
          positionInViewFilterGroup: 0,
        },
        flatEntityMaps:
          createEmptyFlatEntityMaps() as FlatEntityMaps<FlatViewFilter>,
      }),
      viewFilters: [
        {
          id: KEPT_FILTER_ID,
          fieldMetadataId: NAME_FIELD_ID,
          operand: ViewFilterOperand.CONTAINS,
          value: 'acme',
          viewFilterGroupId: null,
          positionInViewFilterGroup: null,
        },
      ],
    });

    expect(viewFilter.flatEntityToUpdate).toEqual([
      expect.objectContaining({
        id: KEPT_FILTER_ID,
        viewFilterGroupId: null,
        viewFilterGroupUniversalIdentifier: null,
        positionInViewFilterGroup: null,
      }),
    ]);
  });

  it('leaves the children of an omitted kind untouched', () => {
    const { viewFilterGroup, viewFilter, viewSort } =
      buildViewFiltersAndSortsUpsertFlatOperations(baseArgs);

    for (const operations of [viewFilterGroup, viewFilter, viewSort]) {
      expect(operations).toEqual({
        flatEntityToCreate: [],
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      });
    }
  });
});
