import {
  FieldMetadataType,
  type ViewFieldRelationScope,
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewSortDirection,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { fromViewFieldRelationScopeToUniversalRelationScope } from 'src/engine/metadata-modules/flat-view-field/utils/from-view-field-relation-scope-to-universal-relation-scope.util';
import { fromUniversalRelationScopeToViewFieldRelationScope } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view-field/services/utils/from-universal-relation-scope-to-view-field-relation-scope.util';

const TASK_FIELD_ID = '11111111-1111-4111-8111-000000000001';
const TASK_FIELD_UNIVERSAL_IDENTIFIER = '20202020-1111-4111-8111-000000000001';
const STATUS_FIELD_ID = '11111111-2222-4222-8222-000000000002';
const STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-2222-4222-8222-000000000002';
const CREATED_AT_FIELD_ID = '11111111-3333-4333-8333-000000000003';
const CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-3333-4333-8333-000000000003';
const FILTER_GROUP_ID = '33333333-3333-4333-8333-333333333333';

const fieldMetadataRows: [
  id: string,
  universalIdentifier: string,
  type: FieldMetadataType,
][] = [
  [TASK_FIELD_ID, TASK_FIELD_UNIVERSAL_IDENTIFIER, FieldMetadataType.RELATION],
  [
    STATUS_FIELD_ID,
    STATUS_FIELD_UNIVERSAL_IDENTIFIER,
    FieldMetadataType.SELECT,
  ],
  [
    CREATED_AT_FIELD_ID,
    CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
    FieldMetadataType.DATE_TIME,
  ],
];

const flatFieldMetadatas = fieldMetadataRows.map(
  ([id, universalIdentifier, type]) =>
    getFlatFieldMetadataMock({
      id,
      universalIdentifier,
      objectMetadataId: 'task-target-object-id',
      type,
    }),
);

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
  byUniversalIdentifier: Object.fromEntries(
    flatFieldMetadatas.map((flatFieldMetadata) => [
      flatFieldMetadata.universalIdentifier,
      flatFieldMetadata,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatFieldMetadatas.map((flatFieldMetadata) => [
      flatFieldMetadata.id,
      flatFieldMetadata.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
};

const RELATION_SCOPE: ViewFieldRelationScope = {
  filters: [
    {
      id: '44444444-4444-4444-8444-444444444444',
      fieldMetadataId: TASK_FIELD_ID,
      relationTargetFieldMetadataId: STATUS_FIELD_ID,
      operand: ViewFilterOperand.IS_NOT,
      value: ['DONE'],
      filterGroupId: FILTER_GROUP_ID,
    },
    {
      id: '55555555-5555-4555-8555-555555555555',
      fieldMetadataId: CREATED_AT_FIELD_ID,
      operand: ViewFilterOperand.IS_IN_PAST,
      value: '',
    },
  ],
  filterGroups: [
    { id: FILTER_GROUP_ID, logicalOperator: ViewFilterGroupLogicalOperator.OR },
  ],
  sorts: [
    {
      fieldMetadataId: TASK_FIELD_ID,
      relationTargetFieldMetadataId: CREATED_AT_FIELD_ID,
      direction: ViewSortDirection.DESC,
    },
  ],
  limit: 1,
};

const toUniversal = (relationScope: ViewFieldRelationScope) =>
  fromViewFieldRelationScopeToUniversalRelationScope({
    relationScope,
    fieldMetadataUniversalIdentifierById:
      flatFieldMetadataMaps.universalIdentifierById,
  });

describe('relation scope universal conversion', () => {
  it('replaces every field id with its universal identifier', () => {
    expect(toUniversal(RELATION_SCOPE)).toEqual({
      filters: [
        {
          id: '44444444-4444-4444-8444-444444444444',
          fieldMetadataUniversalIdentifier: TASK_FIELD_UNIVERSAL_IDENTIFIER,
          relationTargetFieldMetadataUniversalIdentifier:
            STATUS_FIELD_UNIVERSAL_IDENTIFIER,
          operand: ViewFilterOperand.IS_NOT,
          value: ['DONE'],
          filterGroupId: FILTER_GROUP_ID,
        },
        {
          id: '55555555-5555-4555-8555-555555555555',
          fieldMetadataUniversalIdentifier:
            CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
          operand: ViewFilterOperand.IS_IN_PAST,
          value: '',
        },
      ],
      filterGroups: RELATION_SCOPE.filterGroups,
      sorts: [
        {
          fieldMetadataUniversalIdentifier: TASK_FIELD_UNIVERSAL_IDENTIFIER,
          relationTargetFieldMetadataUniversalIdentifier:
            CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
          direction: ViewSortDirection.DESC,
        },
      ],
      limit: 1,
    });
  });

  it('marks a field reference whose relation target no longer resolves as unresolved', () => {
    const universalRelationScope = toUniversal({
      ...RELATION_SCOPE,
      filters: [
        {
          ...RELATION_SCOPE.filters[0],
          relationTargetFieldMetadataId: '99999999-9999-4999-8999-999999999999',
        },
      ],
    });

    expect(universalRelationScope.filters[0]).toMatchObject({
      fieldMetadataUniversalIdentifier: null,
    });
    expect(universalRelationScope.filters[0]).not.toHaveProperty(
      'relationTargetFieldMetadataUniversalIdentifier',
    );
  });

  it('marks a field id that no longer resolves as null', () => {
    const universalRelationScope = toUniversal({
      ...RELATION_SCOPE,
      filters: [
        {
          ...RELATION_SCOPE.filters[1],
          fieldMetadataId: '99999999-9999-4999-8999-999999999999',
        },
      ],
    });

    expect(universalRelationScope.filters[0]).toMatchObject({
      fieldMetadataUniversalIdentifier: null,
    });
  });

  it('round-trips back to the same ids', () => {
    expect(
      fromUniversalRelationScopeToViewFieldRelationScope({
        universalRelationScope: toUniversal(RELATION_SCOPE),
        flatFieldMetadataMaps,
      }),
    ).toEqual(RELATION_SCOPE);
  });

  it('reads a null relation target as none', () => {
    expect(
      fromUniversalRelationScopeToViewFieldRelationScope({
        universalRelationScope: {
          filters: [],
          filterGroups: [],
          sorts: [
            {
              fieldMetadataUniversalIdentifier:
                CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
              relationTargetFieldMetadataUniversalIdentifier: null,
              direction: ViewSortDirection.ASC,
            },
          ],
        },
        flatFieldMetadataMaps,
      }).sorts,
    ).toEqual([
      {
        fieldMetadataId: CREATED_AT_FIELD_ID,
        direction: ViewSortDirection.ASC,
      },
    ]);
  });

  it('throws when a universal identifier does not resolve', () => {
    expect(() =>
      fromUniversalRelationScopeToViewFieldRelationScope({
        universalRelationScope: {
          filters: [],
          filterGroups: [],
          sorts: [
            {
              fieldMetadataUniversalIdentifier: 'missing-field',
              direction: ViewSortDirection.ASC,
            },
          ],
        },
        flatFieldMetadataMaps,
      }),
    ).toThrow('missing-field');
  });
});
