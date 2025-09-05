import {
  TEST_FIELD_METADATA_1_ID,
  TEST_OBJECT_METADATA_1_ID,
  TEST_VIEW_1_ID,
} from 'test/integration/constants/test-view-ids.constants';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

import { type ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { type ViewFilterGroupEntity } from 'src/engine/core-modules/view/entities/view-filter-group.entity';
import { type ViewFilterEntity } from 'src/engine/core-modules/view/entities/view-filter.entity';
import { type ViewGroupEntity } from 'src/engine/core-modules/view/entities/view-group.entity';
import { type ViewSortEntity } from 'src/engine/core-modules/view/entities/view-sort.entity';
import { type ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { ViewOpenRecordIn } from 'src/engine/core-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';

export const findViewByIdWithRestApi = async (
  viewId: string,
): Promise<ViewEntity | null> => {
  const response = await makeRestAPIRequest({
    method: 'get',
    path: `/metadata/views/${viewId}`,
    bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  });

  if (response.status === 404) {
    return null;
  }

  return response.body;
};

export const findViewFilterWithRestApi = async (
  viewFilterId: string,
): Promise<ViewFilterEntity | null> => {
  const response = await makeRestAPIRequest({
    method: 'get',
    path: `/metadata/viewFilters/${viewFilterId}`,
    bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  });

  if (response.status === 404) {
    return null;
  }

  return response.body;
};

export const createTestViewWithRestApi = async (
  overrides: Partial<ViewEntity> = {},
): Promise<ViewEntity> => {
  const viewData = {
    id: TEST_VIEW_1_ID,
    name: generateRecordName('Test View'),
    objectMetadataId: TEST_OBJECT_METADATA_1_ID,
    icon: 'IconTable',
    type: ViewType.TABLE,
    key: 'INDEX',
    position: 0,
    isCompact: false,
    openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
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

export const createTestViewFieldWithRestApi = async (
  overrides: Partial<ViewFieldEntity> = {},
): Promise<ViewFieldEntity> => {
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

export const createTestViewFilterWithRestApi = async (
  overrides: Partial<ViewFilterEntity> = {},
): Promise<ViewFilterEntity> => {
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

export const createTestViewSortWithRestApi = async (
  overrides: Partial<ViewSortEntity> = {},
): Promise<ViewSortEntity> => {
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

export const createTestViewGroupWithRestApi = async (
  overrides: Partial<ViewGroupEntity> = {},
): Promise<ViewGroupEntity> => {
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

export const createTestViewFilterGroupWithRestApi = async (
  overrides: Partial<ViewFilterGroupEntity> = {},
): Promise<ViewFilterGroupEntity> => {
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

export const deleteTestViewWithRestApi = async (
  viewId: string,
): Promise<void> => {
  await makeRestAPIRequest({
    method: 'delete',
    path: `/metadata/views/${viewId}`,
    bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  }).catch(() => {});
};

export const deleteTestViewFieldWithRestApi = async (
  viewFieldId: string,
): Promise<void> => {
  await makeRestAPIRequest({
    method: 'delete',
    path: `/metadata/viewFields/${viewFieldId}`,
    bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  }).catch(() => {});
};

export const deleteTestViewFilterWithRestApi = async (
  viewFilterId: string,
): Promise<void> => {
  await makeRestAPIRequest({
    method: 'delete',
    path: `/metadata/viewFilters/${viewFilterId}`,
    bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  }).catch(() => {});
};

export const deleteTestViewSortWithRestApi = async (
  viewSortId: string,
): Promise<void> => {
  await makeRestAPIRequest({
    method: 'delete',
    path: `/metadata/viewSorts/${viewSortId}`,
    bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  }).catch(() => {});
};

export const deleteTestViewGroupWithRestApi = async (
  viewGroupId: string,
): Promise<void> => {
  await makeRestAPIRequest({
    method: 'delete',
    path: `/metadata/viewGroups/${viewGroupId}`,
    bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  }).catch(() => {});
};

export const deleteTestViewFilterGroupWithRestApi = async (
  viewFilterGroupId: string,
): Promise<void> => {
  await makeRestAPIRequest({
    method: 'delete',
    path: `/metadata/viewFilterGroups/${viewFilterGroupId}`,
    bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  }).catch(() => {});
};
