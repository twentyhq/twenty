import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeRecordGqlOperationOrderByFromFlatMaps } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/utils/compute-record-gql-operation-order-by-from-flat-maps.util';

const OPPORTUNITY_ID = '20000000-0000-4000-8000-000000000000';
const COMPANY_ID = '20000000-0000-4000-8000-000000000001';

const field = ({
  id,
  objectMetadataId,
  name,
  type,
  relationTargetObjectMetadataId = null,
}: {
  id: string;
  objectMetadataId: string;
  name: string;
  type: FieldMetadataType;
  relationTargetObjectMetadataId?: string | null;
}) =>
  getFlatFieldMetadataMock({
    id,
    universalIdentifier: id,
    objectMetadataId,
    name,
    type,
    relationTargetObjectMetadataId,
  });

const opportunityFields = [
  field({
    id: '10000000-0000-4000-8000-000000000001',
    objectMetadataId: OPPORTUNITY_ID,
    name: 'closeDate',
    type: FieldMetadataType.DATE_TIME,
  }),
  field({
    id: '10000000-0000-4000-8000-000000000002',
    objectMetadataId: OPPORTUNITY_ID,
    name: 'amount',
    type: FieldMetadataType.CURRENCY,
  }),
  field({
    id: '10000000-0000-4000-8000-000000000003',
    objectMetadataId: OPPORTUNITY_ID,
    name: 'company',
    type: FieldMetadataType.RELATION,
    relationTargetObjectMetadataId: COMPANY_ID,
  }),
  field({
    id: '10000000-0000-4000-8000-000000000004',
    objectMetadataId: OPPORTUNITY_ID,
    name: 'position',
    type: FieldMetadataType.POSITION,
  }),
];
const [CLOSE_DATE, AMOUNT, COMPANY_RELATION] = opportunityFields;
const COMPANY_TITLE = field({
  id: '10000000-0000-4000-8000-000000000005',
  objectMetadataId: COMPANY_ID,
  name: 'title',
  type: FieldMetadataType.TEXT,
});

const buildMaps = () => {
  const opportunity = getFlatObjectMetadataMock({
    id: OPPORTUNITY_ID,
    universalIdentifier: OPPORTUNITY_ID,
    nameSingular: 'opportunity',
    fieldIds: opportunityFields.map(({ id }) => id),
  });
  const company = getFlatObjectMetadataMock({
    id: COMPANY_ID,
    universalIdentifier: COMPANY_ID,
    nameSingular: 'company',
    fieldIds: [COMPANY_TITLE.id],
    labelIdentifierFieldMetadataId: COMPANY_TITLE.id,
  });

  const flatObjectMetadataMaps = [opportunity, company].reduce<
    FlatEntityMaps<FlatObjectMetadata>
  >(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  );
  const flatFieldMetadataMaps = [...opportunityFields, COMPANY_TITLE].reduce<
    FlatEntityMaps<FlatFieldMetadata>
  >(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  );

  return {
    flatObjectMetadata: opportunity,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  };
};

describe('computeRecordGqlOperationOrderByFromFlatMaps', () => {
  const maps = buildMaps();

  it('leaves the order to the query when there is no sort', () => {
    expect(
      computeRecordGqlOperationOrderByFromFlatMaps({
        recordSorts: [],
        ...maps,
      }),
    ).toBeUndefined();
  });

  it('orders by each sort with nulls last, then by position', () => {
    expect(
      computeRecordGqlOperationOrderByFromFlatMaps({
        recordSorts: [
          { fieldMetadataId: CLOSE_DATE.id, direction: 'DESC' },
          { fieldMetadataId: AMOUNT.id, direction: 'ASC' },
        ],
        ...maps,
      }),
    ).toEqual([
      { closeDate: 'DescNullsLast' },
      { amount: { amountMicros: 'AscNullsLast' } },
      { position: 'AscNullsFirst' },
    ]);
  });

  it('orders a relation by the label identifier of its target', () => {
    expect(
      computeRecordGqlOperationOrderByFromFlatMaps({
        recordSorts: [
          { fieldMetadataId: COMPANY_RELATION.id, direction: 'ASC' },
        ],
        ...maps,
      }),
    ).toEqual([
      { company: { title: 'AscNullsLast' } },
      { position: 'AscNullsFirst' },
    ]);
  });

  it('refuses a sort on a field that is not on the object', () => {
    expect(() =>
      computeRecordGqlOperationOrderByFromFlatMaps({
        recordSorts: [{ fieldMetadataId: COMPANY_TITLE.id, direction: 'ASC' }],
        ...maps,
      }),
    ).toThrow('does not exist on opportunity');
  });
});
