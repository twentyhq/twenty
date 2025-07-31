import {
  TEST_FIELD_METADATA_1_ID,
  TEST_OBJECT_METADATA_1_ID,
} from 'test/integration/constants/test-view-ids.constants';

import { ViewField } from 'src/engine/core-modules/view/entities/view-field.entity';
import { ViewFilterGroup } from 'src/engine/core-modules/view/entities/view-filter-group.entity';
import { ViewFilter } from 'src/engine/core-modules/view/entities/view-filter.entity';
import { ViewGroup } from 'src/engine/core-modules/view/entities/view-group.entity';
import { ViewSort } from 'src/engine/core-modules/view/entities/view-sort.entity';
import { View } from 'src/engine/core-modules/view/entities/view.entity';
import { ViewFilterGroupLogicalOperator } from 'src/modules/view/standard-objects/view-filter-group.workspace-entity';

export const createViewData = (overrides: Partial<View> = {}) => ({
  name: 'Test View',
  objectMetadataId: TEST_OBJECT_METADATA_1_ID,
  icon: 'IconTable',
  type: 'table',
  key: 'INDEX',
  position: 0,
  isCompact: false,
  openRecordIn: 'SIDE_PANEL',
  ...overrides,
});

export const updateViewData = (overrides: Partial<View> = {}) => ({
  name: 'Updated View',
  type: 'kanban',
  isCompact: true,
  ...overrides,
});

export const createViewFieldData = (
  viewId: string,
  overrides: Partial<ViewField> = {},
) => ({
  viewId,
  fieldMetadataId: TEST_FIELD_METADATA_1_ID,
  position: 0,
  isVisible: true,
  size: 150,
  ...overrides,
});

export const updateViewFieldData = (overrides: Partial<ViewField> = {}) => ({
  position: 5,
  isVisible: false,
  size: 300,
  ...overrides,
});

export const createViewSortData = (
  viewId: string,
  overrides: Partial<ViewSort> = {},
) => ({
  viewId,
  fieldMetadataId: TEST_FIELD_METADATA_1_ID,
  direction: 'ASC',
  ...overrides,
});

export const updateViewSortData = (overrides: Partial<ViewSort> = {}) => ({
  direction: 'DESC',
  ...overrides,
});

export const createViewFilterData = (
  viewId: string,
  overrides: Partial<ViewFilter> = {},
) => ({
  viewId,
  fieldMetadataId: TEST_FIELD_METADATA_1_ID,
  operand: 'Is',
  value: 'test-value',
  ...overrides,
});

export const updateViewFilterData = (overrides: Partial<ViewFilter> = {}) => ({
  operand: 'IsNot',
  value: 'updated-value',
  ...overrides,
});

export const createViewGroupData = (
  viewId: string,
  overrides: Partial<ViewGroup> = {},
) => ({
  viewId,
  fieldMetadataId: TEST_FIELD_METADATA_1_ID,
  fieldValue: 'test-group-value',
  isVisible: true,
  position: 0,
  ...overrides,
});

export const updateViewGroupData = (overrides: Partial<ViewGroup> = {}) => ({
  fieldValue: 'updated-group-value',
  isVisible: false,
  position: 1,
  ...overrides,
});

export const createViewFilterGroupData = (
  viewId: string,
  overrides: Partial<ViewFilterGroup> = {},
) => ({
  viewId,
  logicalOperator: ViewFilterGroupLogicalOperator.AND,
  ...overrides,
});

export const updateViewFilterGroupData = (
  overrides: Partial<ViewFilterGroup> = {},
) => ({
  logicalOperator: ViewFilterGroupLogicalOperator.OR,
  ...overrides,
});
