import {
  TEST_FIELD_METADATA_1_ID,
  TEST_OBJECT_METADATA_1_ID,
} from 'test/integration/constants/test-view-ids.constants';

export const createViewData = (overrides: Record<string, any> = {}) => ({
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

export const updateViewData = (overrides: Record<string, any> = {}) => ({
  name: 'Updated View',
  type: 'kanban',
  isCompact: true,
  ...overrides,
});

export const createViewFieldData = (
  viewId: string,
  overrides: Record<string, any> = {},
) => ({
  viewId,
  fieldMetadataId: TEST_FIELD_METADATA_1_ID,
  position: 0,
  isVisible: true,
  size: 150,
  ...overrides,
});

export const updateViewFieldData = (overrides: Record<string, any> = {}) => ({
  position: 5,
  isVisible: false,
  size: 300,
  ...overrides,
});

export const createViewSortData = (
  viewId: string,
  overrides: Record<string, any> = {},
) => ({
  viewId,
  fieldMetadataId: TEST_FIELD_METADATA_1_ID,
  direction: 'ASC',
  ...overrides,
});

export const updateViewSortData = (overrides: Record<string, any> = {}) => ({
  direction: 'DESC',
  ...overrides,
});

export const createViewFilterData = (
  viewId: string,
  overrides: Record<string, any> = {},
) => ({
  viewId,
  fieldMetadataId: TEST_FIELD_METADATA_1_ID,
  operand: 'Is',
  value: 'test-value',
  ...overrides,
});

export const updateViewFilterData = (overrides: Record<string, any> = {}) => ({
  operand: 'IsNot',
  value: 'updated-value',
  ...overrides,
});

export const createViewGroupData = (
  viewId: string,
  overrides: Record<string, any> = {},
) => ({
  viewId,
  fieldMetadataId: TEST_FIELD_METADATA_1_ID,
  fieldValue: 'test-group-value',
  isVisible: true,
  position: 0,
  ...overrides,
});

export const updateViewGroupData = (overrides: Record<string, any> = {}) => ({
  fieldValue: 'updated-group-value',
  isVisible: false,
  position: 1,
  ...overrides,
});

export const createViewFilterGroupData = (
  viewId: string,
  overrides: Record<string, any> = {},
) => ({
  viewId,
  logicalOperator: 'AND',
  ...overrides,
});

export const updateViewFilterGroupData = (
  overrides: Record<string, any> = {},
) => ({
  logicalOperator: 'OR',
  ...overrides,
});

export const viewScenarios = {
  minimalView: () => ({
    name: 'Minimal View',
    objectMetadataId: TEST_OBJECT_METADATA_1_ID,
    icon: 'IconList',
  }),

  kanbanView: () => ({
    name: 'Kanban View',
    objectMetadataId: TEST_OBJECT_METADATA_1_ID,
    icon: 'IconDeal',
    type: 'kanban',
    key: 'OPPORTUNITIES',
    position: 1,
    isCompact: true,
    openRecordIn: 'MODAL',
  }),

  compactTableView: () => ({
    name: 'Compact Table View',
    objectMetadataId: TEST_OBJECT_METADATA_1_ID,
    icon: 'IconTable',
    type: 'table',
    key: 'COMPANIES',
    isCompact: true,
  }),

  hiddenViewField: (viewId: string) => ({
    viewId,
    fieldMetadataId: TEST_FIELD_METADATA_1_ID,
    position: 2,
    isVisible: false,
    size: 100,
  }),

  descSort: (viewId: string) => ({
    viewId,
    fieldMetadataId: TEST_FIELD_METADATA_1_ID,
    direction: 'DESC',
  }),

  containsFilter: (viewId: string) => ({
    viewId,
    fieldMetadataId: TEST_FIELD_METADATA_1_ID,
    operand: 'Contains',
    value: 'search-term',
  }),

  andFilterGroup: (viewId: string) => ({
    viewId,
    logicalOperator: 'AND',
  }),

  orFilterGroup: (viewId: string) => ({
    viewId,
    logicalOperator: 'OR',
  }),
};
