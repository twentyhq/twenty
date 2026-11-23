import {
  FieldMetadataType,
  type UniversalViewFieldRelationScope,
  type ViewFieldRelationScope,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { recomputeViewFieldRelationScopesOnFlatFieldMetadataOptionsUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-view-field-relation-scopes-on-flat-field-metadata-options-update.util';
import { fromViewFieldRelationScopeToUniversalRelationScope } from 'src/engine/metadata-modules/flat-view-field/utils/from-view-field-relation-scope-to-universal-relation-scope.util';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';

const STATUS_FILTER_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_FILTER_ID = '22222222-2222-4222-8222-222222222222';
const TASK_FIELD_ID = '33333333-3333-4333-8333-333333333333';
const CREATED_AT_FIELD_ID = '44444444-4444-4444-8444-444444444444';

const fromFlatFieldMetadata = getFlatFieldMetadataMock({
  id: '55555555-5555-4555-8555-555555555555',
  universalIdentifier: 'task-status',
  objectMetadataId: 'task-object-id',
  type: FieldMetadataType.SELECT,
  options: [
    { id: 'todo', color: 'red', label: 'To do', position: 0, value: 'TODO' },
    { id: 'done', color: 'green', label: 'Done', position: 1, value: 'DONE' },
  ],
}) as FlatFieldMetadata<FieldMetadataType.SELECT>;

const fromOptions = fromFlatFieldMetadata.options;

const renamedDoneOptions = fromOptions.map((option) =>
  option.value === 'DONE' ? { ...option, value: 'COMPLETED' } : option,
);

const withoutDoneOptions = fromOptions.filter(
  (option) => option.value !== 'DONE',
);

const fieldMetadataUniversalIdentifierById = {
  [fromFlatFieldMetadata.id]: fromFlatFieldMetadata.universalIdentifier,
  [TASK_FIELD_ID]: 'task-target-task',
  [CREATED_AT_FIELD_ID]: 'task-target-created-at',
};

const createdAtFilter: ViewFieldRelationScope['filters'][number] = {
  id: OTHER_FILTER_ID,
  fieldMetadataId: CREATED_AT_FIELD_ID,
  operand: ViewFilterOperand.IS_NOT_EMPTY,
  value: '',
};

const buildStatusFilter = ({
  value,
  operand = ViewFilterOperand.IS,
}: Pick<ViewFieldRelationScope['filters'][number], 'value'> &
  Partial<
    Pick<ViewFieldRelationScope['filters'][number], 'operand'>
  >): ViewFieldRelationScope['filters'][number] => ({
  id: STATUS_FILTER_ID,
  fieldMetadataId: TASK_FIELD_ID,
  relationTargetFieldMetadataId: fromFlatFieldMetadata.id,
  operand,
  value,
});

const toUniversal = (
  relationScope: ViewFieldRelationScope,
): UniversalViewFieldRelationScope =>
  fromViewFieldRelationScopeToUniversalRelationScope({
    relationScope,
    fieldMetadataUniversalIdentifierById,
  });

const buildScopedViewField = (
  relationScope: ViewFieldRelationScope,
): FlatViewField => ({
  id: 'scoped-view-field-id',
  universalIdentifier: 'scoped-view-field-universal-identifier',
  workspaceId: 'workspace-id',
  applicationId: 'application-id',
  applicationUniversalIdentifier: 'application-universal-identifier',
  fieldMetadataId: 'company-task-targets-field-id',
  fieldMetadataUniversalIdentifier: 'company-task-targets',
  viewId: 'view-id',
  viewUniversalIdentifier: 'view-universal-identifier',
  viewFieldGroupId: null,
  viewFieldGroupUniversalIdentifier: null,
  isVisible: true,
  size: 150,
  position: 1,
  aggregateOperation: null,
  relationTargetFieldMetadataId: null,
  relationTargetFieldMetadataUniversalIdentifier: null,
  relationScope,
  universalRelationScope: toUniversal(relationScope),
  label: null,
  isActive: true,
  isSystemSideEffect: false,
  isCanonical: false,
  overrides: null,
  universalOverrides: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
});

const recompute = ({
  scopedViewField,
  toOptions,
}: {
  scopedViewField: FlatViewField;
  toOptions: FlatFieldMetadata<FieldMetadataType.SELECT>['options'];
}) =>
  recomputeViewFieldRelationScopesOnFlatFieldMetadataOptionsUpdate({
    fromFlatFieldMetadata,
    fromOptions,
    toOptions,
    flatViewFieldMaps: addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: scopedViewField,
      flatEntityMaps: createEmptyFlatEntityMaps(),
    }),
  });

const expectScopeUpdate = ({
  scopedViewField,
  toOptions,
  expectedRelationScope,
}: {
  scopedViewField: FlatViewField;
  toOptions: FlatFieldMetadata<FieldMetadataType.SELECT>['options'];
  expectedRelationScope: ViewFieldRelationScope;
}) =>
  expect(recompute({ scopedViewField, toOptions })).toEqual([
    {
      ...scopedViewField,
      relationScope: expectedRelationScope,
      universalRelationScope: toUniversal(expectedRelationScope),
    },
  ]);

describe('recomputeViewFieldRelationScopesOnFlatFieldMetadataOptionsUpdate', () => {
  it('rewrites a renamed option value in a scope filter', () => {
    const relationScope: ViewFieldRelationScope = {
      filters: [buildStatusFilter({ value: ['DONE'] }), createdAtFilter],
      filterGroups: [],
      sorts: [],
    };

    expectScopeUpdate({
      scopedViewField: buildScopedViewField(relationScope),
      toOptions: renamedDoneOptions,
      expectedRelationScope: {
        ...relationScope,
        filters: [buildStatusFilter({ value: ['COMPLETED'] }), createdAtFilter],
      },
    });
  });

  it('removes a deleted option value from a scope filter', () => {
    const relationScope: ViewFieldRelationScope = {
      filters: [buildStatusFilter({ value: '["TODO","DONE"]' })],
      filterGroups: [],
      sorts: [],
    };

    expectScopeUpdate({
      scopedViewField: buildScopedViewField(relationScope),
      toOptions: withoutDoneOptions,
      expectedRelationScope: {
        ...relationScope,
        filters: [buildStatusFilter({ value: ['TODO'] })],
      },
    });
  });

  it('drops a scope filter left without options, like a view filter', () => {
    const relationScope: ViewFieldRelationScope = {
      filters: [buildStatusFilter({ value: ['DONE'] }), createdAtFilter],
      filterGroups: [],
      sorts: [],
      limit: 1,
    };

    expectScopeUpdate({
      scopedViewField: buildScopedViewField(relationScope),
      toOptions: withoutDoneOptions,
      expectedRelationScope: { ...relationScope, filters: [createdAtFilter] },
    });
  });

  it('rewrites a filter on the field itself, without a relation target', () => {
    const statusFilter = {
      id: STATUS_FILTER_ID,
      fieldMetadataId: fromFlatFieldMetadata.id,
      relationTargetFieldMetadataId: null,
      operand: ViewFilterOperand.IS_NOT,
      value: ['DONE'],
    };
    const relationScope: ViewFieldRelationScope = {
      filters: [statusFilter],
      filterGroups: [],
      sorts: [],
    };

    expectScopeUpdate({
      scopedViewField: buildScopedViewField(relationScope),
      toOptions: renamedDoneOptions,
      expectedRelationScope: {
        ...relationScope,
        filters: [{ ...statusFilter, value: ['COMPLETED'] }],
      },
    });
  });

  it('leaves a scope that does not filter on the field unchanged', () => {
    expect(
      recompute({
        scopedViewField: buildScopedViewField({
          filters: [createdAtFilter],
          filterGroups: [],
          sorts: [],
        }),
        toOptions: withoutDoneOptions,
      }),
    ).toEqual([]);
  });

  it('leaves a value-less scope filter unchanged', () => {
    expect(
      recompute({
        scopedViewField: buildScopedViewField({
          filters: [
            buildStatusFilter({
              operand: ViewFilterOperand.IS_NOT_EMPTY,
              value: '',
            }),
          ],
          filterGroups: [],
          sorts: [],
        }),
        toOptions: withoutDoneOptions,
      }),
    ).toEqual([]);
  });

  it('leaves scopes unchanged when only labels change', () => {
    expect(
      recompute({
        scopedViewField: buildScopedViewField({
          filters: [buildStatusFilter({ value: ['DONE'] })],
          filterGroups: [],
          sorts: [],
        }),
        toOptions: fromOptions.map((option) => ({
          ...option,
          label: `${option.label}!`,
        })),
      }),
    ).toEqual([]);
  });
});
