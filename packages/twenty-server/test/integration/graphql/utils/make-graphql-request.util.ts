import { ASTNode, print } from 'graphql';
import request from 'supertest';
import { CommonResponseBody } from 'test/integration/graphql/types/common-response-body.type';

type GraphqlOperation = {
  query: ASTNode;
  variables?: Record<string, unknown>;
};

export const TESTING_MOCK_ACCESS_TOKEN = {
  ADMIN: ADMIN_ACCESS_TOKEN,
  EXPIRED: EXPIRED_ACCESS_TOKEN,
  INVALID: INVALID_ACCESS_TOKEN,
  MEMBER: MEMBER_ACCESS_TOKEN,
  GUEST: GUEST_ACCESS_TOKEN,
  API_KEY: API_KEY_ACCESS_TOKEN,
} as const;

type TestingMockAccessTokenKeys = keyof typeof TESTING_MOCK_ACCESS_TOKEN;

export type MakeMetadataAPIRequestOptions = {
  unAuthenticated?: boolean;
  authenticationToken?: string;
  testingToken?: TestingMockAccessTokenKeys;
};

type ApiPath = 'metadata' | 'graphql';

export type GraphqlOperationWithOptions = {
  operation: GraphqlOperation;
  options?: MakeMetadataAPIRequestOptions;
};
export const makeGraphqlRequest = async <ResponseTypeT = unknown>(
  path: ApiPath,
  { operation, options }: GraphqlOperationWithOptions,
): CommonResponseBody<ResponseTypeT> => {
  const {
    authenticationToken,
    testingToken,
    unAuthenticated,
  }: MakeMetadataAPIRequestOptions = {
    unAuthenticated: false,
    testingToken: 'ADMIN',
    ...options,
  };

  const client = request(`http://localhost:${APP_PORT}`).post(`/${path}`);

  if (!unAuthenticated) {
    const token = TESTING_MOCK_ACCESS_TOKEN[testingToken];

    client.set('Authorization', `Bearer ${authenticationToken ?? token}`);
  }

  const response = await client.send({
    query: print(operation.query),
    variables: operation.variables || {},
  });

  return {
    data: response.body.data,
    errors: response.body.errors,
    rawResponse: response,
  };
};
