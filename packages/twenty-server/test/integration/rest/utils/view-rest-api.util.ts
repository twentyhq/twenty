import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

import { type ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { type ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { type ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { type ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { type ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewOpenRecordIn } from 'src/engine/metadata-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import { ViewVisibility } from 'src/engine/metadata-modules/view/enums/view-visibility.enum';

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
  params: {
    objectMetadataId: string;
  } & Partial<Omit<ViewEntity, 'objectMetadataId'>>,
): Promise<ViewEntity> => {
  const { objectMetadataId, name, ...restParams } = params;
  const viewData = {
    name: name || generateRecordName('Test View'),
    objectMetadataId,
    icon: 'IconTable',
    type: ViewType.TABLE,
    key: 'INDEX',
    position: 0,
    isCompact: false,
    openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
    visibility: ViewVisibility.WORKSPACE,
    ...restParams,
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
  params: {
    viewId: string;
    fieldMetadataId: string;
  } & Partial<Omit<ViewFieldEntity, 'viewId' | 'fieldMetadataId'>>,
): Promise<ViewFieldEntity> => {
  const { viewId, fieldMetadataId, ...restParams } = params;
  const viewFieldData = {
    viewId,
    fieldMetadataId,
    position: 0,
    isVisible: true,
    size: 150,
    ...restParams,
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
  params: {
    viewId: string;
    fieldMetadataId: string;
  } & Partial<Omit<ViewFilterEntity, 'viewId' | 'fieldMetadataId'>>,
): Promise<ViewFilterEntity> => {
  const { viewId, fieldMetadataId, operand, value, ...restParams } = params;
  const viewFilterData = {
    viewId,
    fieldMetadataId,
    operand: operand || 'Is',
    value: value || 'test-value',
    ...restParams,
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
  params: {
    viewId: string;
    fieldMetadataId: string;
  } & Partial<Omit<ViewSortEntity, 'viewId' | 'fieldMetadataId'>>,
): Promise<ViewSortEntity> => {
  const { viewId, fieldMetadataId, direction, ...restParams } = params;
  const viewSortData = {
    viewId,
    fieldMetadataId,
    direction: direction || 'ASC',
    ...restParams,
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
  params: {
    viewId: string;
    fieldMetadataId: string;
  } & Partial<Omit<ViewGroupEntity, 'viewId' | 'fieldMetadataId'>>,
): Promise<ViewGroupEntity> => {
  const { viewId, fieldMetadataId, fieldValue, ...restParams } = params;
  const viewGroupData = {
    viewId,
    fieldMetadataId,
    isVisible: true,
    fieldValue: fieldValue || 'test-group-value',
    position: 0,
    ...restParams,
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
  params: {
    viewId: string;
  } & Partial<Omit<ViewFilterGroupEntity, 'viewId'>>,
): Promise<ViewFilterGroupEntity> => {
  const { viewId, logicalOperator, ...restParams } = params;
  const viewFilterGroupData = {
    viewId,
    logicalOperator: logicalOperator || 'AND',
    ...restParams,
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
