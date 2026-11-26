import {
  FieldMetadataType,
  RelationType,
  type UniversalViewFieldRelationScope,
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewSortDirection,
} from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { validateFlatViewFieldRelationScope } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-field-relation-scope.util';

const FILTER_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_FILTER_ID = '22222222-2222-4222-8222-222222222222';
const FILTER_GROUP_ID = '33333333-3333-4333-8333-333333333333';
const OTHER_FILTER_GROUP_ID = '44444444-4444-4444-8444-444444444444';
const THIRD_FILTER_GROUP_ID = '55555555-5555-4555-8555-555555555555';

const buildFlatFieldMetadata = (
  flatFieldMetadata: Partial<FlatFieldMetadata> &
    Pick<
      FlatFieldMetadata,
      'universalIdentifier' | 'type' | 'objectMetadataUniversalIdentifier'
    >,
) =>
  getFlatFieldMetadataMock({
    objectMetadataId: flatFieldMetadata.objectMetadataUniversalIdentifier,
    ...flatFieldMetadata,
  });

const companyTaskTargetsField = buildFlatFieldMetadata({
  universalIdentifier: 'company-task-targets',
  type: FieldMetadataType.RELATION,
  objectMetadataUniversalIdentifier: 'company',
  relationTargetObjectMetadataUniversalIdentifier: 'task-target',
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});

const companyAccountOwnerField = buildFlatFieldMetadata({
  universalIdentifier: 'company-account-owner',
  type: FieldMetadataType.RELATION,
  objectMetadataUniversalIdentifier: 'company',
  relationTargetObjectMetadataUniversalIdentifier: 'workspace-member',
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'accountOwnerId',
  },
});

const companyNameField = buildFlatFieldMetadata({
  universalIdentifier: 'company-name',
  type: FieldMetadataType.TEXT,
  objectMetadataUniversalIdentifier: 'company',
});

const flatFieldMetadatas = [
  companyTaskTargetsField,
  companyAccountOwnerField,
  companyNameField,
  buildFlatFieldMetadata({
    universalIdentifier: 'task-target-task',
    type: FieldMetadataType.RELATION,
    objectMetadataUniversalIdentifier: 'task-target',
    relationTargetObjectMetadataUniversalIdentifier: 'task',
    universalSettings: {
      relationType: RelationType.MANY_TO_ONE,
      joinColumnName: 'taskId',
    },
  }),
  buildFlatFieldMetadata({
    universalIdentifier: 'task-target-created-at',
    type: FieldMetadataType.DATE_TIME,
    objectMetadataUniversalIdentifier: 'task-target',
  }),
  buildFlatFieldMetadata({
    universalIdentifier: 'task-target-deactivated',
    type: FieldMetadataType.TEXT,
    objectMetadataUniversalIdentifier: 'task-target',
    isActive: false,
  }),
  buildFlatFieldMetadata({
    universalIdentifier: 'task-target-children',
    type: FieldMetadataType.RELATION,
    objectMetadataUniversalIdentifier: 'task-target',
    relationTargetObjectMetadataUniversalIdentifier: 'note',
    universalSettings: { relationType: RelationType.ONE_TO_MANY },
  }),
  buildFlatFieldMetadata({
    universalIdentifier: 'task-status',
    type: FieldMetadataType.SELECT,
    objectMetadataUniversalIdentifier: 'task',
    options: [
      { id: 'todo', value: 'TODO', label: 'To do', position: 0, color: 'red' },
      { id: 'done', value: 'DONE', label: 'Done', position: 1, color: 'green' },
    ],
  }),
  buildFlatFieldMetadata({
    universalIdentifier: 'task-due-at',
    type: FieldMetadataType.DATE_TIME,
    objectMetadataUniversalIdentifier: 'task',
  }),
  buildFlatFieldMetadata({
    universalIdentifier: 'task-deactivated',
    type: FieldMetadataType.TEXT,
    objectMetadataUniversalIdentifier: 'task',
    isActive: false,
  }),
  buildFlatFieldMetadata({
    universalIdentifier: 'task-assignee',
    type: FieldMetadataType.RELATION,
    objectMetadataUniversalIdentifier: 'task',
    relationTargetObjectMetadataUniversalIdentifier: 'workspace-member',
    universalSettings: {
      relationType: RelationType.MANY_TO_ONE,
      joinColumnName: 'assigneeId',
    },
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

const openTasksFilter = {
  id: FILTER_ID,
  fieldMetadataUniversalIdentifier: 'task-target-task',
  relationTargetFieldMetadataUniversalIdentifier: 'task-status',
  operand: ViewFilterOperand.IS_NOT,
  value: ['DONE'],
};

const dueAtSort = {
  fieldMetadataUniversalIdentifier: 'task-target-task',
  relationTargetFieldMetadataUniversalIdentifier: 'task-due-at',
  direction: ViewSortDirection.ASC,
};

const OPEN_TASKS_SCOPE: UniversalViewFieldRelationScope = {
  filters: [openTasksFilter],
  filterGroups: [],
  sorts: [dueAtSort],
  limit: 1,
};

const validate = ({
  universalRelationScope,
  isCanonical = false,
  flatFieldMetadata = companyTaskTargetsField,
}: {
  universalRelationScope: UniversalViewFieldRelationScope | null;
  isCanonical?: boolean;
  flatFieldMetadata?: UniversalFlatFieldMetadata;
}) =>
  validateFlatViewFieldRelationScope({
    flatViewField: { isCanonical, universalRelationScope },
    flatFieldMetadata,
    flatFieldMetadataMaps,
    flatFieldMetadataOptionMaps: { byUniversalIdentifier: {} },
  });

const expectOneErrorContaining = ({
  universalRelationScope,
  expectedMessage,
}: {
  universalRelationScope: UniversalViewFieldRelationScope;
  expectedMessage: string;
}) =>
  expect(validate({ universalRelationScope })).toMatchObject([
    { message: expect.stringContaining(expectedMessage) },
  ]);

describe('validateFlatViewFieldRelationScope', () => {
  it('accepts a view field without a relation scope', () => {
    expect(validate({ universalRelationScope: null })).toEqual([]);
  });

  it('accepts open tasks sorted by due date, first one', () => {
    expect(validate({ universalRelationScope: OPEN_TASKS_SCOPE })).toEqual([]);
  });

  it('accepts nested filter groups', () => {
    expect(
      validate({
        universalRelationScope: {
          filters: [
            { ...openTasksFilter, filterGroupId: OTHER_FILTER_GROUP_ID },
            {
              id: OTHER_FILTER_ID,
              fieldMetadataUniversalIdentifier: 'task-target-created-at',
              operand: ViewFilterOperand.IS_NOT_EMPTY,
              value: '',
              filterGroupId: FILTER_GROUP_ID,
            },
          ],
          filterGroups: [
            {
              id: FILTER_GROUP_ID,
              logicalOperator: ViewFilterGroupLogicalOperator.OR,
            },
            {
              id: OTHER_FILTER_GROUP_ID,
              parentFilterGroupId: FILTER_GROUP_ID,
              logicalOperator: ViewFilterGroupLogicalOperator.AND,
            },
          ],
          sorts: [],
        },
      }),
    ).toEqual([]);
  });

  it('rejects a scope on a canonical view field', () => {
    expect(
      validate({ universalRelationScope: OPEN_TASKS_SCOPE, isCanonical: true }),
    ).toMatchObject([
      { message: expect.stringContaining('Only non-canonical view fields') },
    ]);
  });

  it.each([
    {
      title: 'a many-to-one relation',
      flatFieldMetadata: companyAccountOwnerField,
    },
    { title: 'a non-relation field', flatFieldMetadata: companyNameField },
    {
      title: 'a morph relation',
      flatFieldMetadata: buildFlatFieldMetadata({
        ...companyTaskTargetsField,
        type: FieldMetadataType.MORPH_RELATION,
      }),
    },
  ])('rejects a scope on $title', ({ flatFieldMetadata }) => {
    expect(
      validate({ universalRelationScope: OPEN_TASKS_SCOPE, flatFieldMetadata }),
    ).toMatchObject([
      { message: expect.stringContaining('one-to-many relation field') },
    ]);
  });

  it.each([
    { title: 'missing', fieldMetadataUniversalIdentifier: 'missing-field' },
    { title: 'unresolved', fieldMetadataUniversalIdentifier: null },
    {
      title: 'of another object',
      fieldMetadataUniversalIdentifier: 'task-due-at',
    },
  ])(
    'rejects a filter on a field that is $title',
    ({ fieldMetadataUniversalIdentifier }) =>
      expectOneErrorContaining({
        universalRelationScope: {
          ...OPEN_TASKS_SCOPE,
          filters: [
            {
              id: FILTER_ID,
              fieldMetadataUniversalIdentifier,
              operand: ViewFilterOperand.IS_NOT_EMPTY,
              value: '',
            },
          ],
        },
        expectedMessage: 'must belong to the relation target object',
      }),
  );

  it('rejects a filter on a deactivated field', () =>
    expectOneErrorContaining({
      universalRelationScope: {
        ...OPEN_TASKS_SCOPE,
        filters: [
          {
            id: FILTER_ID,
            fieldMetadataUniversalIdentifier: 'task-target-deactivated',
            operand: ViewFilterOperand.IS_NOT_EMPTY,
            value: '',
          },
        ],
      },
      expectedMessage: 'must be active',
    }));

  it('rejects a filter on a one-to-many relation of the related object', () =>
    expectOneErrorContaining({
      universalRelationScope: {
        ...OPEN_TASKS_SCOPE,
        filters: [
          {
            id: FILTER_ID,
            fieldMetadataUniversalIdentifier: 'task-target-children',
            operand: ViewFilterOperand.IS_NOT_EMPTY,
            value: '',
          },
        ],
      },
      expectedMessage: 'cannot be one-to-many relations',
    }));

  it('rejects a related record field on a field that is not a many-to-one relation', () =>
    expectOneErrorContaining({
      universalRelationScope: {
        ...OPEN_TASKS_SCOPE,
        filters: [
          {
            ...openTasksFilter,
            fieldMetadataUniversalIdentifier: 'task-target-created-at',
          },
        ],
      },
      expectedMessage: 'can only be used on a many-to-one relation field',
    }));

  it.each([
    {
      title: 'of another object',
      relationTargetFieldMetadataUniversalIdentifier: 'task-target-created-at',
      expectedMessage: 'must belong to the relation target object',
    },
    {
      title: 'deactivated',
      relationTargetFieldMetadataUniversalIdentifier: 'task-deactivated',
      expectedMessage: 'must be active',
    },
    {
      title: 'a relation',
      relationTargetFieldMetadataUniversalIdentifier: 'task-assignee',
      expectedMessage: 'cannot be a relation',
    },
  ])(
    'rejects a related record field that is $title',
    ({ relationTargetFieldMetadataUniversalIdentifier, expectedMessage }) =>
      expectOneErrorContaining({
        universalRelationScope: {
          ...OPEN_TASKS_SCOPE,
          filters: [],
          sorts: [
            { ...dueAtSort, relationTargetFieldMetadataUniversalIdentifier },
          ],
        },
        expectedMessage,
      }),
  );

  it('treats a null related record field as none', () => {
    expect(
      validate({
        universalRelationScope: {
          ...OPEN_TASKS_SCOPE,
          filters: [],
          sorts: [
            {
              ...dueAtSort,
              relationTargetFieldMetadataUniversalIdentifier: null,
            },
          ],
        },
      }),
    ).toEqual([]);
  });

  it('rejects an operand the related record field does not support', () =>
    expectOneErrorContaining({
      universalRelationScope: {
        ...OPEN_TASKS_SCOPE,
        filters: [{ ...openTasksFilter, operand: ViewFilterOperand.CONTAINS }],
      },
      expectedMessage: 'is not supported on field type',
    }));

  it('rejects a select option the related record field does not have', () =>
    expectOneErrorContaining({
      universalRelationScope: {
        ...OPEN_TASKS_SCOPE,
        filters: [{ ...openTasksFilter, value: ['ARCHIVED'] }],
      },
      expectedMessage: 'ARCHIVED',
    }));

  it('rejects duplicated filter ids', () =>
    expectOneErrorContaining({
      universalRelationScope: {
        ...OPEN_TASKS_SCOPE,
        filters: [openTasksFilter, openTasksFilter],
      },
      expectedMessage: 'filter ids must be unique UUIDs',
    }));

  it('rejects a filter id that is not a UUID', () =>
    expectOneErrorContaining({
      universalRelationScope: {
        ...OPEN_TASKS_SCOPE,
        filters: [{ ...openTasksFilter, id: 'open' }],
      },
      expectedMessage: 'filter ids must be unique UUIDs',
    }));

  it('rejects a filter in a group the scope does not declare', () =>
    expectOneErrorContaining({
      universalRelationScope: {
        ...OPEN_TASKS_SCOPE,
        filters: [{ ...openTasksFilter, filterGroupId: FILTER_GROUP_ID }],
      },
      expectedMessage: 'filter group not found',
    }));

  it('rejects a filter group whose parent the scope does not declare', () =>
    expectOneErrorContaining({
      universalRelationScope: {
        ...OPEN_TASKS_SCOPE,
        filterGroups: [
          {
            id: FILTER_GROUP_ID,
            parentFilterGroupId: OTHER_FILTER_GROUP_ID,
            logicalOperator: ViewFilterGroupLogicalOperator.AND,
          },
        ],
      },
      expectedMessage: 'filter group parent not found',
    }));

  it('rejects a second root filter group, which the query would drop', () =>
    expectOneErrorContaining({
      universalRelationScope: {
        ...OPEN_TASKS_SCOPE,
        filterGroups: [
          {
            id: FILTER_GROUP_ID,
            logicalOperator: ViewFilterGroupLogicalOperator.AND,
          },
          {
            id: OTHER_FILTER_GROUP_ID,
            logicalOperator: ViewFilterGroupLogicalOperator.OR,
          },
        ],
      },
      expectedMessage: 'one root filter group',
    }));

  it('rejects filter groups nested in each other', () => {
    expect(
      validate({
        universalRelationScope: {
          ...OPEN_TASKS_SCOPE,
          filterGroups: [
            {
              id: FILTER_GROUP_ID,
              parentFilterGroupId: OTHER_FILTER_GROUP_ID,
              logicalOperator: ViewFilterGroupLogicalOperator.AND,
            },
            {
              id: OTHER_FILTER_GROUP_ID,
              parentFilterGroupId: FILTER_GROUP_ID,
              logicalOperator: ViewFilterGroupLogicalOperator.OR,
            },
          ],
        },
      }),
    ).toMatchObject([
      { message: expect.stringContaining('nested one level deep') },
      { message: expect.stringContaining('nested one level deep') },
    ]);
  });

  it('rejects filter groups nested more than one level deep', () =>
    expectOneErrorContaining({
      universalRelationScope: {
        ...OPEN_TASKS_SCOPE,
        filterGroups: [
          {
            id: FILTER_GROUP_ID,
            logicalOperator: ViewFilterGroupLogicalOperator.AND,
          },
          {
            id: OTHER_FILTER_GROUP_ID,
            parentFilterGroupId: FILTER_GROUP_ID,
            logicalOperator: ViewFilterGroupLogicalOperator.OR,
          },
          {
            id: THIRD_FILTER_GROUP_ID,
            parentFilterGroupId: OTHER_FILTER_GROUP_ID,
            logicalOperator: ViewFilterGroupLogicalOperator.AND,
          },
        ],
      },
      expectedMessage: 'nested one level deep',
    }));

  it('rejects a sort on a one-to-many relation', () =>
    expectOneErrorContaining({
      universalRelationScope: {
        ...OPEN_TASKS_SCOPE,
        sorts: [
          {
            fieldMetadataUniversalIdentifier: 'task-target-children',
            direction: ViewSortDirection.DESC,
          },
        ],
      },
      expectedMessage: 'cannot be one-to-many relations',
    }));

  it('rejects an invalid sort direction', () =>
    expectOneErrorContaining({
      universalRelationScope: {
        ...OPEN_TASKS_SCOPE,
        sorts: [{ ...dueAtSort, direction: 'UP' as ViewSortDirection }],
      },
      expectedMessage: 'invalid direction',
    }));

  it.each([0, 61, 1.5])('rejects a limit of %s', (limit) =>
    expectOneErrorContaining({
      universalRelationScope: { ...OPEN_TASKS_SCOPE, limit },
      expectedMessage: 'limit must be an integer between 1 and 60',
    }),
  );

  it('accepts the maximum limit', () => {
    expect(
      validate({ universalRelationScope: { ...OPEN_TASKS_SCOPE, limit: 60 } }),
    ).toEqual([]);
  });
});
