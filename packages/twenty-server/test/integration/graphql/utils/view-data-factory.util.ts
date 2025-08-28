import {
  TEST_FIELD_METADATA_1_ID,
  TEST_OBJECT_METADATA_1_ID,
} from 'test/integration/constants/test-view-ids.constants';

import { type ViewField } from 'src/engine/core-modules/view/entities/view-field.entity';
import { type ViewFilterGroup } from 'src/engine/core-modules/view/entities/view-filter-group.entity';
import { type ViewFilter } from 'src/engine/core-modules/view/entities/view-filter.entity';
import { type ViewGroup } from 'src/engine/core-modules/view/entities/view-group.entity';
import { type ViewSort } from 'src/engine/core-modules/view/entities/view-sort.entity';
import { type View } from 'src/engine/core-modules/view/entities/view.entity';
import { ViewFilterGroupLogicalOperator } from 'src/engine/core-modules/view/enums/view-filter-group-logical-operator';
import { ViewFilterOperand } from 'src/engine/core-modules/view/enums/view-filter-operand';
import { ViewOpenRecordIn } from 'src/engine/core-modules/view/enums/view-open-record-in';
import { ViewSortDirection } from 'src/engine/core-modules/view/enums/view-sort-direction';
import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';

export const createViewData = (overrides: Partial<View> = {}) => ({
  name: 'Test View',
  objectMetadataId: TEST_OBJECT_METADATA_1_ID,
  icon: 'IconTable',
  type: ViewType.TABLE,
  key: null,
  position: 0,
  isCompact: false,
  openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
  ...overrides,
});

export const updateViewData = (overrides: Partial<View> = {}) => ({
  name: 'Updated View',
  type: ViewType.KANBAN,
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
  direction: ViewSortDirection.ASC,
  ...overrides,
});

export const updateViewSortData = (overrides: Partial<ViewSort> = {}) => ({
  direction: ViewSortDirection.DESC,
  ...overrides,
});

export const createViewFilterData = (
  viewId: string,
  overrides: Partial<ViewFilter> = {},
) => ({
  viewId,
  fieldMetadataId: TEST_FIELD_METADATA_1_ID,
  operand: ViewFilterOperand.IS,
  value: 'test-value',
  ...overrides,
});

export const updateViewFilterData = (overrides: Partial<ViewFilter> = {}) => ({
  operand: ViewFilterOperand.IS_NOT,
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
