import {
  type ChartFilter,
  FieldMetadataType,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { convertChartFilterToGqlOperationFilter } from 'src/modules/dashboard/chart-data/utils/convert-chart-filter-to-gql-operation-filter.util';

const userTimezone = 'Europe/Paris';
const currentWorkspaceMemberId = 'd9f0e9c0-1a3b-4f6f-9c1f-7b1d6a2c8b11';

const createdByFieldMetadata = {
  id: 'created-by-field-id',
  name: 'createdBy',
  type: FieldMetadataType.RELATION,
  universalIdentifier: 'created-by-universal-id',
  relationTargetObjectMetadataId: 'workspace-member-object-id',
} as FlatFieldMetadata;

const flatFieldMetadataMaps = {
  byUniversalIdentifier: {
    [createdByFieldMetadata.universalIdentifier]: createdByFieldMetadata,
  },
  universalIdentifierById: {
    [createdByFieldMetadata.id]: createdByFieldMetadata.universalIdentifier,
  },
  universalIdentifiersByApplicationId: {},
} as unknown as FlatEntityMaps<FlatFieldMetadata>;

describe('convertChartFilterToGqlOperationFilter', () => {
  it('returns an empty filter when no filter is provided', () => {
    const result = convertChartFilterToGqlOperationFilter({
      filter: undefined,
      flatFieldMetadataMaps,
      userTimezone,
    });

    expect(result).toEqual({});
  });

  it('forwards currentWorkspaceMemberId so the "me" filter resolves to the current workspace member', () => {
    const filter: ChartFilter = {
      recordFilters: [
        {
          fieldMetadataId: createdByFieldMetadata.id,
          operand: ViewFilterOperand.IS,
          value: JSON.stringify({
            isCurrentWorkspaceMemberSelected: true,
            selectedRecordIds: [],
          }),
          type: FieldMetadataType.RELATION,
        },
      ],
    };

    const result = convertChartFilterToGqlOperationFilter({
      filter,
      flatFieldMetadataMaps,
      userTimezone,
      currentWorkspaceMemberId,
    });

    expect(result).toEqual({
      [`${createdByFieldMetadata.name}Id`]: {
        in: [currentWorkspaceMemberId],
      },
    });
  });

  it('discards a "me" filter when no currentWorkspaceMemberId is provided', () => {
    const filter: ChartFilter = {
      recordFilters: [
        {
          fieldMetadataId: createdByFieldMetadata.id,
          operand: ViewFilterOperand.IS,
          value: JSON.stringify({
            isCurrentWorkspaceMemberSelected: true,
            selectedRecordIds: [],
          }),
          type: FieldMetadataType.RELATION,
        },
      ],
    };

    const result = convertChartFilterToGqlOperationFilter({
      filter,
      flatFieldMetadataMaps,
      userTimezone,
    });

    expect(result).toEqual({});
  });
});
