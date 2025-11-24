import { ViewFilterOperand } from 'twenty-shared/types';

import { type UpdateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/update-view-field.input';
import { type ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { type ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view-filter-group/enums/view-filter-group-logical-operator';
import { type ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { type ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { type ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { ViewSortDirection } from 'src/engine/metadata-modules/view-sort/enums/view-sort-direction';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewOpenRecordIn } from 'src/engine/metadata-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import { ViewVisibility } from 'src/engine/metadata-modules/view/enums/view-visibility.enum';

export const createViewData = (overrides: Partial<ViewEntity> = {}) => ({
  name: 'Test View',
  icon: 'IconTable',
  type: ViewType.TABLE,
  key: null,
  position: 0,
  isCompact: false,
  openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
  visibility: ViewVisibility.WORKSPACE,
  ...overrides,
});

export const updateViewData = (overrides: Partial<ViewEntity> = {}) => ({
  name: 'Updated View',
  type: ViewType.KANBAN,
  isCompact: true,
  ...overrides,
});

export const createViewFieldData = (
  viewId: string,
  overrides: Partial<ViewFieldEntity> = {},
) => ({
  viewId,
  position: 0,
  isVisible: true,
  size: 150,
  ...overrides,
});

export const updateViewFieldData = (
  overrides: Partial<UpdateViewFieldInput['update']> = {},
) => ({
  position: 5,
  isVisible: false,
  size: 300,
  ...overrides,
});

export const createViewSortData = (
  viewId: string,
  overrides: Partial<ViewSortEntity> = {},
) => ({
  viewId,
  direction: ViewSortDirection.ASC,
  ...overrides,
});

export const updateViewSortData = (
  overrides: Partial<ViewSortEntity> = {},
) => ({
  direction: ViewSortDirection.DESC,
  ...overrides,
});

export const createViewFilterData = (
  viewId: string,
  overrides: Partial<ViewFilterEntity> = {},
) => ({
  viewId,
  operand: ViewFilterOperand.IS,
  value: 'test-value',
  ...overrides,
});

export const updateViewFilterData = (
  overrides: Partial<ViewFilterEntity> = {},
) => ({
  operand: ViewFilterOperand.IS_NOT,
  value: 'updated-value',
  ...overrides,
});

export const createViewGroupData = (
  viewId: string,
  overrides: Partial<ViewGroupEntity> = {},
) => ({
  viewId,
  fieldValue: 'test-group-value',
  isVisible: true,
  position: 0,
  ...overrides,
});

export const updateViewGroupData = (
  overrides: Partial<ViewGroupEntity> = {},
) => ({
  fieldValue: 'updated-group-value',
  isVisible: false,
  position: 1,
  ...overrides,
});

export const createViewFilterGroupData = (
  viewId: string,
  overrides: Partial<ViewFilterGroupEntity> = {},
) => ({
  viewId,
  logicalOperator: ViewFilterGroupLogicalOperator.AND,
  ...overrides,
});

export const updateViewFilterGroupData = (
  overrides: Partial<ViewFilterGroupEntity> = {},
) => ({
  logicalOperator: ViewFilterGroupLogicalOperator.OR,
  ...overrides,
});
