import { type GraphQLResponse } from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { type ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';

import { createViewOperationFactory } from './create-view-operation-factory.util';
import { createViewData } from './view-data-factory.util';

interface CreateViewResponse extends Record<string, unknown> {
  createCoreView: ViewEntity;
}

export const createTestViewWithGraphQL = async (
  overrides: Partial<ViewEntity> = {},
): Promise<ViewEntity> => {
  const input = createViewData(overrides);

  const operation = createViewOperationFactory({ data: input });
  const response = (await makeGraphqlAPIRequest(
    operation,
  )) as GraphQLResponse<CreateViewResponse>;

  if (response.body.errors) {
    throw new Error(
      `Failed to create test view: ${JSON.stringify(response.body.errors)}`,
    );
  }

  if (!response.body.data) {
    throw new Error('No data returned from createTestViewWithGraphQL');
  }

  return response.body.data.createCoreView;
};
