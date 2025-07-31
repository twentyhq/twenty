import {
  TEST_FIELD_METADATA_1_ID,
  TEST_OBJECT_METADATA_1_ID,
  TEST_VIEW_1_ID,
} from 'test/integration/constants/test-view-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

import { ViewField } from 'src/engine/core-modules/view/entities/view-field.entity';
import { ViewFilterGroup } from 'src/engine/core-modules/view/entities/view-filter-group.entity';
import { ViewFilter } from 'src/engine/core-modules/view/entities/view-filter.entity';
import { ViewGroup } from 'src/engine/core-modules/view/entities/view-group.entity';
import { ViewSort } from 'src/engine/core-modules/view/entities/view-sort.entity';
import { View } from 'src/engine/core-modules/view/entities/view.entity';

interface RestResponse {
  status: number;
  body: any;
}

export const cleanupViewRecords = async (): Promise<void> => {
  // @ts-expect-error legacy noImplicitAny
  await global.testDataSource.query(`DELETE from "core"."view"`);
};

export const createTestView = async (
  overrides: Partial<View> = {},
): Promise<View> => {
  const viewData = {
    id: TEST_VIEW_1_ID,
    name: generateRecordName('Test View'),
    objectMetadataId: TEST_OBJECT_METADATA_1_ID,
    icon: 'IconTable',
    type: 'table',
    key: 'INDEX',
    position: 0,
    isCompact: false,
    openRecordIn: 'SIDE_PANEL',
    ...overrides,
  };

  const response = await makeRestAPIRequest({
    method: 'post',
    path: '/metadata/views',
    body: viewData,
    bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  });

  if (response.status !== 201) {
    throw new Error(
      `Failed to create test view: ${response.status} - ${JSON.stringify(response.body)}`,
    );
  }

  return response.body;
};

export const createTestViewField = async (
  overrides: Partial<ViewField> = {},
): Promise<ViewField> => {
  const viewFieldData = {
    viewId: TEST_VIEW_1_ID,
    fieldMetadataId: TEST_FIELD_METADATA_1_ID,
    position: 0,
    isVisible: true,
    size: 150,
    ...overrides,
  };

  const response = await makeRestAPIRequest({
    method: 'post',
    path: '/metadata/viewFields',
    body: viewFieldData,
    bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  });

  if (response.status !== 201) {
    throw new Error(
      `Failed to create test view field: ${response.status} - ${JSON.stringify(response.body)}`,
    );
  }

  return response.body;
};

export const createTestViewFilter = async (
  overrides: Partial<ViewFilter> = {},
): Promise<ViewFilter> => {
  const viewFilterData = {
    viewId: TEST_VIEW_1_ID,
    fieldMetadataId: TEST_FIELD_METADATA_1_ID,
    operand: 'Is',
    value: 'test-value',
    ...overrides,
  };

  const response = await makeRestAPIRequest({
    method: 'post',
    path: '/metadata/viewFilters',
    body: viewFilterData,
    bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  });

  if (response.status !== 201) {
    throw new Error(
      `Failed to create test view filter: ${response.status} - ${JSON.stringify(response.body)}`,
    );
  }

  return response.body;
};

export const createTestViewSort = async (
  overrides: Partial<ViewSort> = {},
): Promise<ViewSort> => {
  const viewSortData = {
    viewId: TEST_VIEW_1_ID,
    fieldMetadataId: TEST_FIELD_METADATA_1_ID,
    direction: 'ASC',
    ...overrides,
  };

  const response = await makeRestAPIRequest({
    method: 'post',
    path: '/metadata/viewSorts',
    body: viewSortData,
    bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  });

  if (response.status !== 201) {
    throw new Error(
      `Failed to create test view sort: ${response.status} - ${JSON.stringify(response.body)}`,
    );
  }

  return response.body;
};

export const createTestViewGroup = async (
  overrides: Partial<ViewGroup> = {},
): Promise<ViewGroup> => {
  const viewGroupData = {
    viewId: TEST_VIEW_1_ID,
    fieldMetadataId: TEST_FIELD_METADATA_1_ID,
    isVisible: true,
    fieldValue: 'test-group-value',
    position: 0,
    ...overrides,
  };

  const response = await makeRestAPIRequest({
    method: 'post',
    path: '/metadata/viewGroups',
    body: viewGroupData,
    bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  });

  if (response.status !== 201) {
    throw new Error(
      `Failed to create test view group: ${response.status} - ${JSON.stringify(response.body)}`,
    );
  }

  return response.body;
};

export const createTestViewFilterGroup = async (
  overrides: Partial<ViewFilterGroup> = {},
): Promise<ViewFilterGroup> => {
  const viewFilterGroupData = {
    viewId: TEST_VIEW_1_ID,
    logicalOperator: 'AND',
    ...overrides,
  };

  const response = await makeRestAPIRequest({
    method: 'post',
    path: '/metadata/viewFilterGroups',
    body: viewFilterGroupData,
    bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  });

  if (response.status !== 201) {
    throw new Error(
      `Failed to create test view filter group: ${response.status} - ${JSON.stringify(response.body)}`,
    );
  }

  return response.body;
};

export const deleteTestView = async (viewId: string): Promise<void> => {
  await makeRestAPIRequest({
    method: 'delete',
    path: `/metadata/views/${viewId}`,
    bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  }).catch(() => {});
};

export const deleteTestViewField = async (
  viewFieldId: string,
): Promise<void> => {
  await makeRestAPIRequest({
    method: 'delete',
    path: `/metadata/viewFields/${viewFieldId}`,
    bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  }).catch(() => {});
};

export const deleteTestViewFilter = async (
  viewFilterId: string,
): Promise<void> => {
  await makeRestAPIRequest({
    method: 'delete',
    path: `/metadata/viewFilters/${viewFilterId}`,
    bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  }).catch(() => {});
};

export const deleteTestViewSort = async (viewSortId: string): Promise<void> => {
  await makeRestAPIRequest({
    method: 'delete',
    path: `/metadata/viewSorts/${viewSortId}`,
    bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  }).catch(() => {});
};

export const deleteTestViewGroup = async (
  viewGroupId: string,
): Promise<void> => {
  await makeRestAPIRequest({
    method: 'delete',
    path: `/metadata/viewGroups/${viewGroupId}`,
    bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  }).catch(() => {});
};

export const deleteTestViewFilterGroup = async (
  viewFilterGroupId: string,
): Promise<void> => {
  await makeRestAPIRequest({
    method: 'delete',
    path: `/metadata/viewFilterGroups/${viewFilterGroupId}`,
    bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  }).catch(() => {});
};

export const assertSuccessfulResponse = (
  response: RestResponse,
  expectedStatus = 200,
) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toBeDefined();

  // For successful responses, we shouldn't have error properties
  if (response.body.error || response.body.errors) {
    throw new Error(
      `Expected successful response but got errors: ${JSON.stringify(response.body)}`,
    );
  }
};

export const assertErrorResponse = (
  response: RestResponse,
  expectedStatus = 400,
  expectedErrorMessage?: string,
) => {
  expect(response.status).toBe(expectedStatus);

  if (expectedErrorMessage && response.body.message) {
    expect(response.body.message).toContain(expectedErrorMessage);
  }
};

export const assertViewStructure = (
  view: View,
  expectedFields?: Partial<View>,
) => {
  expect(view).toBeDefined();
  expect(view.id).toBeDefined();
  expect(view.name).toBeDefined();
  expect(view.objectMetadataId).toBeDefined();
  expect(view.workspaceId).toBeDefined();
  expect(view.createdAt).toBeDefined();
  expect(view.updatedAt).toBeDefined();

  if (expectedFields) {
    expect(view).toMatchObject(expectedFields);
  }
};

export const assertViewFieldStructure = (
  viewField: ViewField,
  expectedFields?: Partial<ViewField>,
) => {
  expect(viewField).toBeDefined();
  expect(viewField.id).toBeDefined();
  expect(viewField.fieldMetadataId).toBeDefined();
  expect(viewField.viewId).toBeDefined();
  expect(typeof viewField.position).toBe('number');
  expect(typeof viewField.isVisible).toBe('boolean');
  expect(typeof viewField.size).toBe('number');

  if (expectedFields) {
    expect(viewField).toMatchObject(expectedFields);
  }
};

export const assertViewSortStructure = (
  viewSort: ViewSort,
  expectedFields?: Partial<ViewSort>,
) => {
  expect(viewSort).toBeDefined();
  expect(viewSort.id).toBeDefined();
  expect(viewSort.fieldMetadataId).toBeDefined();
  expect(viewSort.viewId).toBeDefined();
  expect(viewSort.direction).toBeDefined();
  expect(['ASC', 'DESC']).toContain(viewSort.direction);

  if (expectedFields) {
    expect(viewSort).toMatchObject(expectedFields);
  }
};

export const assertViewFilterStructure = (
  viewFilter: ViewFilter,
  expectedFields?: Partial<ViewFilter>,
) => {
  expect(viewFilter).toBeDefined();
  expect(viewFilter.id).toBeDefined();
  expect(viewFilter.fieldMetadataId).toBeDefined();
  expect(viewFilter.viewId).toBeDefined();
  expect(viewFilter.operand).toBeDefined();
  expect(viewFilter.value).toBeDefined();

  if (expectedFields) {
    expect(viewFilter).toMatchObject(expectedFields);
  }
};

export const assertViewGroupStructure = (
  viewGroup: ViewGroup,
  expectedFields?: Partial<ViewGroup>,
) => {
  expect(viewGroup).toBeDefined();
  expect(viewGroup.id).toBeDefined();
  expect(viewGroup.fieldMetadataId).toBeDefined();
  expect(viewGroup.viewId).toBeDefined();
  expect(viewGroup.fieldValue).toBeDefined();
  expect(typeof viewGroup.isVisible).toBe('boolean');
  expect(typeof viewGroup.position).toBe('number');

  if (expectedFields) {
    expect(viewGroup).toMatchObject(expectedFields);
  }
};

export const assertViewFilterGroupStructure = (
  viewFilterGroup: ViewFilterGroup,
  expectedFields?: Partial<ViewFilterGroup>,
) => {
  expect(viewFilterGroup).toBeDefined();
  expect(viewFilterGroup.id).toBeDefined();
  expect(viewFilterGroup.viewId).toBeDefined();
  expect(viewFilterGroup.logicalOperator).toBeDefined();
  expect(['AND', 'OR', 'NOT']).toContain(viewFilterGroup.logicalOperator);

  if (expectedFields) {
    expect(viewFilterGroup).toMatchObject(expectedFields);
  }
};
