import { ASTNode, print } from 'graphql';
import request from 'supertest';
import { CommonResponseBody } from 'test/integration/types/common-response-body.type';

type GraphqlOperation = {
  query: ASTNode;
  variables?: Record<string, unknown>;
};

export type MakeMetadataAPIRequestOptions = {
  unAuthenticated?: boolean;
  authenticationToken?: string;
};
const defaultOptions: MakeMetadataAPIRequestOptions = {
  unAuthenticated: false,
};

export type GraphqlOperationWithOptions = {
  operation: GraphqlOperation;
  options: MakeMetadataAPIRequestOptions;
};
export const makeGraphqlRequest = async <T>(
  path: 'metadata' | 'graphql',
  { operation, options = defaultOptions }: GraphqlOperationWithOptions,
): CommonResponseBody<T> => {
  const { unAuthenticated, authenticationToken } = options;
  const client = request(`http://localhost:${APP_PORT}`).post(`/${path}`);

  if (!unAuthenticated) {
    client.set(
      'Authorization',
      `Bearer ${authenticationToken ?? ADMIN_ACCESS_TOKEN}`,
    );
  }

  const response = await client.send({
    query: print(operation.query),
    variables: operation.variables || {},
  });

  return {
    data: response.body.data,
    errors: response.body.errors,
  };
};
