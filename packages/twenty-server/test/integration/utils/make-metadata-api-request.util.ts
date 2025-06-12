import {
  GraphqlOperationWithOptions,
  makeGraphqlRequest,
} from 'test/integration/utils/make-graphql-request.util';

export const makeMetadataAPIRequest = async <T>(
  operationAndOptions: GraphqlOperationWithOptions,
) => await makeGraphqlRequest<T>('metadata', operationAndOptions);
