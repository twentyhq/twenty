import {
  AggregateOperations,
  FieldMetadataType,
  RelationType,
  type UniversalViewFieldRelationScope,
  ViewSortDirection,
} from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { validateFlatViewFieldRelationAggregate } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-field-relation-aggregate.util';

const buildFlatFieldMetadata = (
  flatFieldMetadata: Partial<FlatFieldMetadata> &
    Pick<
      FlatFieldMetadata,
      'universalIdentifier' | 'type' | 'objectMetadataUniversalIdentifier'
    >,
) =>
  getFlatFieldMetadataMock({
    objectMetadataId: flatFieldMetadata.objectMetadataUniversalIdentifier,
    name: flatFieldMetadata.universalIdentifier,
    ...flatFieldMetadata,
  });

const companyOpportunitiesField = buildFlatFieldMetadata({
  universalIdentifier: 'company-opportunities',
  type: FieldMetadataType.RELATION,
  objectMetadataUniversalIdentifier: 'company',
  relationTargetObjectMetadataUniversalIdentifier: 'opportunity',
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});

const flatFieldMetadatas = [
  companyOpportunitiesField,
  buildFlatFieldMetadata({
    universalIdentifier: 'amount',
    type: FieldMetadataType.CURRENCY,
    objectMetadataUniversalIdentifier: 'opportunity',
  }),
  buildFlatFieldMetadata({
    universalIdentifier: 'closeDate',
    type: FieldMetadataType.DATE_TIME,
    objectMetadataUniversalIdentifier: 'opportunity',
  }),
  buildFlatFieldMetadata({
    universalIdentifier: 'name',
    type: FieldMetadataType.TEXT,
    objectMetadataUniversalIdentifier: 'opportunity',
  }),
];

const flatFieldMetadataMaps = {
  byUniversalIdentifier: Object.fromEntries(
    flatFieldMetadatas.map((flatFieldMetadata) => [
      flatFieldMetadata.universalIdentifier,
      flatFieldMetadata,
    ]),
  ),
};

const FILTER_ONLY_SCOPE: UniversalViewFieldRelationScope = {
  filters: [],
  filterGroups: [],
  sorts: [],
};

const validate = ({
  aggregateOperation,
  relationTargetFieldMetadataUniversalIdentifier = null,
  universalRelationScope = FILTER_ONLY_SCOPE,
}: {
  aggregateOperation: AggregateOperations | null;
  relationTargetFieldMetadataUniversalIdentifier?: string | null;
  universalRelationScope?: UniversalViewFieldRelationScope;
}) =>
  validateFlatViewFieldRelationAggregate({
    flatViewField: {
      relationTargetFieldMetadataUniversalIdentifier,
      universalRelationScope: { ...universalRelationScope, aggregateOperation },
    },
    flatFieldMetadataMaps,
  });

describe('validateFlatViewFieldRelationAggregate', () => {
  it('accepts a column without an aggregate', () => {
    expect(validate({ aggregateOperation: null })).toEqual([]);
  });

  it('accepts a count of the related records the scope keeps', () => {
    expect(validate({ aggregateOperation: AggregateOperations.COUNT })).toEqual(
      [],
    );
  });

  it.each([
    { operation: AggregateOperations.SUM, field: 'amount' },
    { operation: AggregateOperations.AVG, field: 'amount' },
    { operation: AggregateOperations.MIN, field: 'closeDate' },
    { operation: AggregateOperations.MAX, field: 'closeDate' },
  ])('accepts $operation of $field', ({ operation, field }) => {
    expect(
      validate({
        aggregateOperation: operation,
        relationTargetFieldMetadataUniversalIdentifier: field,
      }),
    ).toEqual([]);
  });

  it.each([
    {
      title: 'a sort',
      universalRelationScope: {
        ...FILTER_ONLY_SCOPE,
        sorts: [
          {
            fieldMetadataUniversalIdentifier: 'closeDate',
            direction: ViewSortDirection.ASC,
          },
        ],
      },
    },
    {
      title: 'a limit',
      universalRelationScope: { ...FILTER_ONLY_SCOPE, limit: 5 },
    },
  ])(
    'rejects an aggregate whose scope has $title',
    ({ universalRelationScope }) => {
      expect(
        validate({
          aggregateOperation: AggregateOperations.COUNT,
          universalRelationScope,
        }),
      ).toMatchObject([
        { message: expect.stringContaining('cannot have sorts or a limit') },
      ]);
    },
  );

  it('rejects a count with a related record field', () => {
    expect(
      validate({
        aggregateOperation: AggregateOperations.COUNT,
        relationTargetFieldMetadataUniversalIdentifier: 'amount',
      }),
    ).toMatchObject([
      {
        message: expect.stringContaining('cannot have a related record field'),
      },
    ]);
  });

  it('rejects a sum without a related record field', () => {
    expect(
      validate({ aggregateOperation: AggregateOperations.SUM }),
    ).toMatchObject([
      { message: expect.stringContaining('requires a related record field') },
    ]);
  });

  it('rejects an operation other than count, sum, average, min and max', () => {
    expect(
      validate({
        aggregateOperation: AggregateOperations.COUNT_EMPTY,
        relationTargetFieldMetadataUniversalIdentifier: 'name',
      }),
    ).toMatchObject([
      { message: expect.stringContaining('Only count, sum, average') },
    ]);
  });

  it.each([
    { operation: AggregateOperations.SUM, field: 'name' },
    { operation: AggregateOperations.AVG, field: 'closeDate' },
  ])(
    'rejects $operation of a $field field that does not support it',
    ({ operation, field }) => {
      expect(
        validate({
          aggregateOperation: operation,
          relationTargetFieldMetadataUniversalIdentifier: field,
        }),
      ).toMatchObject([
        { message: expect.stringContaining('does not support this aggregate') },
      ]);
    },
  );

  it('leaves a missing related record field to the relation target validator', () => {
    expect(
      validate({
        aggregateOperation: AggregateOperations.SUM,
        relationTargetFieldMetadataUniversalIdentifier: 'missing-field',
      }),
    ).toEqual([]);
  });
});
