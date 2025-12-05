import { type GraphQLResponse } from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { type PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

import { createPageLayoutOperationFactory } from './create-page-layout-operation-factory.util';
import { destroyPageLayoutOperationFactory } from './destroy-page-layout-operation-factory.util';
import { findPageLayoutsOperationFactory } from './find-page-layouts-operation-factory.util';

interface CreatePageLayoutResponse extends Record<string, unknown> {
  createPageLayout: PageLayoutEntity;
}

export const createTestPageLayoutWithGraphQL = async (
  data: {
    name: string;
    type?: PageLayoutType;
    objectMetadataId?: string;
  } = { name: 'Test Page Layout' },
): Promise<PageLayoutEntity> => {
  const operation = createPageLayoutOperationFactory({
    data: {
      name: data.name,
      type: data.type || PageLayoutType.RECORD_PAGE,
      objectMetadataId: data.objectMetadataId,
    },
  });

  const response = (await makeGraphqlAPIRequest(
    operation,
  )) as GraphQLResponse<CreatePageLayoutResponse>;

  if (response.body.errors) {
    throw new Error(
      `Failed to create test page layout: ${JSON.stringify(response.body.errors)}`,
    );
  }

  if (!response.body.data) {
    throw new Error('No data returned from createTestPageLayoutWithGraphQL');
  }

  return response.body.data.createPageLayout;
};

export const cleanupPageLayoutRecordsWithGraphQL = async (): Promise<void> => {
  const operation = findPageLayoutsOperationFactory();
  const response = await makeGraphqlAPIRequest(operation);

  if (response.body.data?.getPageLayouts) {
    for (const pageLayout of response.body.data.getPageLayouts) {
      const destroyOperation = destroyPageLayoutOperationFactory({
        pageLayoutId: pageLayout.id,
      });

      await makeGraphqlAPIRequest(destroyOperation);
    }
  }
};
