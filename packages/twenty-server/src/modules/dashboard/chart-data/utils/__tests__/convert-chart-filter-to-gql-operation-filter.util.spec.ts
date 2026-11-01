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

const buildOwnerFieldMetadata = ({
  id,
  name,
  universalIdentifier,
  relationTargetFieldMetadataId = null,
  relationTargetObjectMetadataId = null,
}: {
  id: string;
  name: string;
  universalIdentifier: string;
  relationTargetFieldMetadataId?: string | null;
  relationTargetObjectMetadataId?: string | null;
}) =>
  ({
    id,
    name,
    universalIdentifier,
    type: FieldMetadataType.MORPH_RELATION,
    morphId: OWNER_MORPH_ID,
    objectMetadataId: 'pet-object-id',
    relationTargetFieldMetadataId,
    relationTargetObjectMetadataId,
    settings: { relationType: RelationType.MANY_TO_ONE },
    universalSettings: { relationType: RelationType.MANY_TO_ONE },
  }) as unknown as FlatFieldMetadata;

const ownerHeadFieldMetadata = buildOwnerFieldMetadata({
  id: 'owner-head-field-id',
  name: 'owner',
  universalIdentifier: OWNER_MORPH_ID,
});

const ownerCompanyFieldMetadata = buildOwnerFieldMetadata({
  id: 'owner-company-field-id',
  name: 'ownerCompany',
  universalIdentifier: 'owner-company-universal-id',
  relationTargetFieldMetadataId: 'company-pets-field-id',
  relationTargetObjectMetadataId: 'company-object-id',
});

const ownerPersonFieldMetadata = buildOwnerFieldMetadata({
  id: 'owner-person-field-id',
  name: 'ownerPerson',
  universalIdentifier: 'owner-person-universal-id',
  relationTargetFieldMetadataId: 'person-pets-field-id',
  relationTargetObjectMetadataId: 'person-object-id',
});

const buildPetsFieldMetadata = ({
  id,
  objectMetadataId,
}: {
  id: string;
  objectMetadataId: string;
}) =>
  ({
    id,
    name: 'pets',
    universalIdentifier: `${id}-universal-id`,
    type: FieldMetadataType.RELATION,
    objectMetadataId,
    relationTargetObjectMetadataId: 'pet-object-id',
    settings: { relationType: RelationType.ONE_TO_MANY },
  }) as unknown as FlatFieldMetadata;

const toFlatEntityMaps = <
  TFlatEntity extends { id: string; universalIdentifier: string },
>(
  flatEntities: TFlatEntity[],
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
  buildPetsFieldMetadata({
    id: 'company-pets-field-id',
    objectMetadataId: 'company-object-id',
  }),
  buildPetsFieldMetadata({
    id: 'person-pets-field-id',
    objectMetadataId: 'person-object-id',
  }),
]) as unknown as FlatEntityMaps<FlatFieldMetadata>;

const objectMetadatas = [
  {
    id: 'pet-object-id',
    universalIdentifier: 'pet-universal-id',
    nameSingular: 'pet',
    namePlural: 'pets',
    fieldIds: [
      ownerHeadFieldMetadata.id,
      ownerCompanyFieldMetadata.id,
      ownerPersonFieldMetadata.id,
    ],
  },
  {
    id: 'company-object-id',
    universalIdentifier: 'company-universal-id',
    nameSingular: 'company',
    namePlural: 'companies',
    fieldIds: ['company-pets-field-id'],
  },
  {
    id: 'person-object-id',
    universalIdentifier: 'person-universal-id',
    nameSingular: 'person',
    namePlural: 'people',
    fieldIds: ['person-pets-field-id'],
  },
];

const flatObjectMetadataMaps = toFlatEntityMaps(
  objectMetadatas,
) as unknown as FlatEntityMaps<FlatObjectMetadata>;

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

  it('checks every target join column for an empty filter on a morph relation target', () => {
    const filter: ChartFilter = {
      recordFilters: [
        {
          fieldMetadataId: ownerCompanyFieldMetadata.id,
          operand: ViewFilterOperand.IS_EMPTY,
          value: '',
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
      and: [
        { ownerCompanyId: { is: 'NULL' } },
        { ownerPersonId: { is: 'NULL' } },
      ],
    });
  });
});
