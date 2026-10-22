import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { recomputeViewFiltersOnFlatFieldMetadataOptionsUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-view-filters-on-flat-field-metadata-options-update.util';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';

const FILTER_ID = '11111111-1111-4111-8111-111111111111';

const fromFlatFieldMetadata = getFlatFieldMetadataMock({
  id: '22222222-2222-4222-8222-222222222222',
  universalIdentifier: '22222222-2222-4222-8222-222222222222',
  objectMetadataId: '33333333-3333-4333-8333-333333333333',
  type: FieldMetadataType.SELECT,
  options: [
    {
      id: '44444444-4444-4444-8444-444444444444',
      color: 'blue',
      label: 'Shortlisted',
      position: 0,
      value: 'SHORTLISTED',
    },
  ],
  viewFilterIds: [FILTER_ID],
}) as FlatFieldMetadata<FieldMetadataType.SELECT>;

const toOptions = [
  {
    ...fromFlatFieldMetadata.options![0],
    label: 'Selected',
    value: 'SELECTED',
  },
];

const buildViewFilter = ({
  operand,
  value,
}: Pick<FlatViewFilter, 'operand' | 'value'>): FlatViewFilter => ({
  id: FILTER_ID,
  universalIdentifier: FILTER_ID,
  workspaceId: '55555555-5555-4555-8555-555555555555',
  applicationId: '66666666-6666-4666-8666-666666666666',
  applicationUniversalIdentifier: '66666666-6666-4666-8666-666666666666',
  viewId: '77777777-7777-4777-8777-777777777777',
  viewUniversalIdentifier: '77777777-7777-4777-8777-777777777777',
  fieldMetadataId: fromFlatFieldMetadata.id,
  fieldMetadataUniversalIdentifier: fromFlatFieldMetadata.universalIdentifier,
  operand,
  value,
  subFieldName: null,
  viewFilterGroupId: null,
  viewFilterGroupUniversalIdentifier: null,
  positionInViewFilterGroup: null,
  relationTargetFieldMetadataId: null,
  relationTargetFieldMetadataUniversalIdentifier: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  deletedAt: null,
});

const recomputeForViewFilter = (viewFilter: FlatViewFilter) =>
  recomputeViewFiltersOnFlatFieldMetadataOptionsUpdate({
    fromFlatFieldMetadata,
    toOptions,
    flatViewFilterMaps: addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: viewFilter,
      flatEntityMaps: createEmptyFlatEntityMaps(),
    }),
  });

describe('recomputeViewFiltersOnFlatFieldMetadataOptionsUpdate', () => {
  it('updates a stringified select filter value', () => {
    const viewFilter = buildViewFilter({
      operand: ViewFilterOperand.IS,
      value: '["SHORTLISTED"]',
    });

    expect(recomputeForViewFilter(viewFilter)).toEqual({
      flatViewFiltersToDelete: [],
      flatViewFiltersToUpdate: [{ ...viewFilter, value: ['SELECTED'] }],
    });
  });

  it('leaves a filter whose value is not an array of options unchanged', () => {
    const viewFilter = buildViewFilter({
      operand: ViewFilterOperand.IS,
      value: 'SHORTLISTED',
    });

    expect(recomputeForViewFilter(viewFilter)).toEqual({
      flatViewFiltersToDelete: [],
      flatViewFiltersToUpdate: [],
    });
  });

  it('leaves a value-less select filter unchanged', () => {
    const viewFilter = buildViewFilter({
      operand: ViewFilterOperand.IS_NOT_EMPTY,
      value: '',
    });

    expect(recomputeForViewFilter(viewFilter)).toEqual({
      flatViewFiltersToDelete: [],
      flatViewFiltersToUpdate: [],
    });
  });
});
