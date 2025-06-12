import { GraphqlOperationWithOptions } from 'test/integration/utils/make-graphql-request.util';
import { makeMetadataAPIRequest } from 'test/integration/utils/make-metadata-api-request.util';

export const makeMetadataAPIRequestWithMemberRole = (
  operationAndOptions: GraphqlOperationWithOptions,
) =>
  makeMetadataAPIRequest({
    ...operationAndOptions,
    options: {
      ...operationAndOptions,
      authenticationToken: MEMBER_ACCESS_TOKEN,
    },
  });
