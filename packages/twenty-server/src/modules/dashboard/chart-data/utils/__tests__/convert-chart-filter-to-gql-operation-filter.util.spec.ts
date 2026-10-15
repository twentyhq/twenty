import {
  type ChartFilter,
  FieldMetadataType,
  RelationType,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
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

const OWNER_MORPH_ID = 'owner-morph-id';

const ownerHeadFieldMetadata = {
  id: 'owner-head-field-id',
  name: 'owner',
  type: FieldMetadataType.MORPH_RELATION,
  universalIdentifier: OWNER_MORPH_ID,
  morphId: OWNER_MORPH_ID,
  relationTargetObjectMetadataId: null,
  settings: { relationType: RelationType.MANY_TO_ONE },
} as unknown as FlatFieldMetadata;

const ownerCompanyFieldMetadata = {
  id: 'owner-company-field-id',
  name: 'ownerCompany',
  type: FieldMetadataType.MORPH_RELATION,
  universalIdentifier: 'owner-company-universal-id',
  morphId: OWNER_MORPH_ID,
  relationTargetObjectMetadataId: 'company-object-id',
  settings: { relationType: RelationType.MANY_TO_ONE },
} as unknown as FlatFieldMetadata;

const ownerPersonFieldMetadata = {
  id: 'owner-person-field-id',
  name: 'ownerPerson',
  type: FieldMetadataType.MORPH_RELATION,
  universalIdentifier: 'owner-person-universal-id',
  morphId: OWNER_MORPH_ID,
  relationTargetObjectMetadataId: 'person-object-id',
  settings: { relationType: RelationType.MANY_TO_ONE },
} as unknown as FlatFieldMetadata;

const toFlatEntityMaps = (
  flatEntities: { id: string; universalIdentifier: string }[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.id,
      flatEntity.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

const flatFieldMetadataMaps = toFlatEntityMaps([
  createdByFieldMetadata,
  ownerHeadFieldMetadata,
  ownerCompanyFieldMetadata,
  ownerPersonFieldMetadata,
]) as unknown as FlatEntityMaps<FlatFieldMetadata>;

const companyObjectMetadata = {
  id: 'company-object-id',
  universalIdentifier: 'company-universal-id',
  nameSingular: 'company',
  namePlural: 'companies',
};

const personObjectMetadata = {
  id: 'person-object-id',
  universalIdentifier: 'person-universal-id',
  nameSingular: 'person',
  namePlural: 'people',
};

const flatObjectMetadataMaps = toFlatEntityMaps([
  companyObjectMetadata,
  personObjectMetadata,
]) as unknown as FlatEntityMaps<FlatObjectMetadata>;

describe('convertChartFilterToGqlOperationFilter', () => {
  it('returns an empty filter when no filter is provided', () => {
    const result = convertChartFilterToGqlOperationFilter({
      filter: undefined,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
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
      flatObjectMetadataMaps,
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
      flatObjectMetadataMaps,
      userTimezone,
    });

    expect(result).toEqual({});
  });

  it('checks every target join column for an empty filter on a morph relation head', () => {
    const filter: ChartFilter = {
      recordFilters: [
        {
          fieldMetadataId: ownerHeadFieldMetadata.id,
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          value: '',
          type: FieldMetadataType.MORPH_RELATION,
        },
      ],
    };

    const result = convertChartFilterToGqlOperationFilter({
      filter,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      userTimezone,
    });

    expect(result).toEqual({
      not: {
        and: [
          { ownerCompanyId: { is: 'NULL' } },
          { ownerPersonId: { is: 'NULL' } },
        ],
      },
    });
  });

  it('checks the join column of a morph relation target for an empty filter on that target', () => {
    const filter: ChartFilter = {
      recordFilters: [
        {
          fieldMetadataId: ownerCompanyFieldMetadata.id,
          operand: ViewFilterOperand.IS_EMPTY,
          value: '',
          type: FieldMetadataType.MORPH_RELATION,
        },
      ],
    };

    const result = convertChartFilterToGqlOperationFilter({
      filter,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      userTimezone,
    });

    expect(result).toEqual({ ownerCompanyId: { is: 'NULL' } });
  });
});
