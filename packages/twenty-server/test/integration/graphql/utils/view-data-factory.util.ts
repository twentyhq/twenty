import { type UpdateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-field.input';
import { type ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { type ViewFilterGroupEntity } from 'src/engine/core-modules/view/entities/view-filter-group.entity';
import { type ViewFilterEntity } from 'src/engine/core-modules/view/entities/view-filter.entity';
import { type ViewGroupEntity } from 'src/engine/core-modules/view/entities/view-group.entity';
import { type ViewSortEntity } from 'src/engine/core-modules/view/entities/view-sort.entity';
import { type ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { ViewFilterGroupLogicalOperator } from 'src/engine/core-modules/view/enums/view-filter-group-logical-operator';
import { ViewFilterOperand } from 'src/engine/core-modules/view/enums/view-filter-operand';
import { ViewOpenRecordIn } from 'src/engine/core-modules/view/enums/view-open-record-in';
import { ViewSortDirection } from 'src/engine/core-modules/view/enums/view-sort-direction';
import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';

export const createViewData = (overrides: Partial<ViewEntity> = {}) => ({
  name: 'Test View',
  icon: 'IconTable',
  type: ViewType.TABLE,
  key: null,
  position: 0,
  isCompact: false,
  openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
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
