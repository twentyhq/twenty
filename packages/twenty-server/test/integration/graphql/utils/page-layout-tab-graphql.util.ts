import { type GraphQLResponse } from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { type UpdatePageLayoutTabInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-tab.input';
import { type PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';

import { createPageLayoutTabOperationFactory } from './create-page-layout-tab-operation-factory.util';
import { destroyPageLayoutTabOperationFactory } from './destroy-page-layout-tab-operation-factory.util';
import { findPageLayoutTabsOperationFactory } from './find-page-layout-tabs-operation-factory.util';
import { updatePageLayoutTabOperationFactory } from './update-page-layout-tab-operation-factory.util';

interface CreatePageLayoutTabResponse extends Record<string, unknown> {
  createPageLayoutTab: PageLayoutTabEntity;
}

interface FindPageLayoutTabsResponse extends Record<string, unknown> {
  getPageLayoutTabs: PageLayoutTabEntity[];
}

interface UpdatePageLayoutTabResponse extends Record<string, unknown> {
  updatePageLayoutTab: PageLayoutTabEntity;
}

export const createTestPageLayoutTabWithGraphQL = async (data: {
  title: string;
  position?: number;
  pageLayoutId: string;
}): Promise<PageLayoutTabEntity> => {
  const operation = createPageLayoutTabOperationFactory({
    data: {
      title: data.title,
      position: data.position || 0,
      pageLayoutId: data.pageLayoutId,
    },
  });

  const response = (await makeGraphqlAPIRequest(
    operation,
  )) as GraphQLResponse<CreatePageLayoutTabResponse>;

  if (response.body.errors) {
    throw new Error(
      `Failed to create test page layout tab: ${JSON.stringify(response.body.errors)}`,
    );
  }

  if (!response.body.data) {
    throw new Error('No data returned from createTestPageLayoutTabWithGraphQL');
  }

  return response.body.data.createPageLayoutTab;
};

export const findPageLayoutTabsWithGraphQL = async (
  pageLayoutId: string,
): Promise<PageLayoutTabEntity[]> => {
  const operation = findPageLayoutTabsOperationFactory({ pageLayoutId });

  const response = (await makeGraphqlAPIRequest(
    operation,
  )) as GraphQLResponse<FindPageLayoutTabsResponse>;

  if (response.body.errors) {
    throw new Error(
      `Failed to find page layout tabs: ${JSON.stringify(response.body.errors)}`,
    );
  }

  if (!response.body.data) {
    throw new Error('No data returned from findPageLayoutTabsWithGraphQL');
  }

  return response.body.data.getPageLayoutTabs;
};

export const updateTestPageLayoutTabWithGraphQL = async (
  pageLayoutTabId: string,
  data: UpdatePageLayoutTabInput,
): Promise<PageLayoutTabEntity> => {
  const operation = updatePageLayoutTabOperationFactory({
    pageLayoutTabId,
    data,
  });

  const response = (await makeGraphqlAPIRequest(
    operation,
  )) as GraphQLResponse<UpdatePageLayoutTabResponse>;

  if (response.body.errors) {
    throw new Error(
      `Failed to update test page layout tab: ${JSON.stringify(response.body.errors)}`,
    );
  }

  if (!response.body.data) {
    throw new Error('No data returned from updateTestPageLayoutTabWithGraphQL');
  }

  return response.body.data.updatePageLayoutTab;
};

export const cleanupPageLayoutTabRecordsWithGraphQL = async (
  pageLayoutId: string,
): Promise<void> => {
  const operation = findPageLayoutTabsOperationFactory({ pageLayoutId });
  const response = await makeGraphqlAPIRequest(operation);

  if (response.body.data?.getPageLayoutTabs) {
    for (const pageLayoutTab of response.body.data.getPageLayoutTabs) {
      const destroyOperation = destroyPageLayoutTabOperationFactory({
        pageLayoutTabId: pageLayoutTab.id,
      });

      await makeGraphqlAPIRequest(destroyOperation);
    }
  }
};
