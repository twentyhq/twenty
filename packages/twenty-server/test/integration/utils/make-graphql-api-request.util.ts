import {
  GraphqlOperationWithOptions,
  makeGraphqlRequest,
} from 'test/integration/utils/make-graphql-request.util';

export const makeGraphqlAPIRequest = async <T>(
  operationAndOptions: GraphqlOperationWithOptions,
) => await makeGraphqlRequest<T>('graphql', operationAndOptions);
