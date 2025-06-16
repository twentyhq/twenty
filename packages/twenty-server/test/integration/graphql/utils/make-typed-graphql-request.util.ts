import { TypedDocumentNode } from '@apollo/client';
import { print } from 'graphql';
import request from 'supertest';
import { CommonResponseBody } from './common-response-body.type';

type ApiPath = 'graphql' | 'metadata';

type TestingMockAccessTokenKeys = 'ADMIN' | 'MEMBER';

type MakeGraphqlRequestOptions = {
  authenticationToken?: string;
  testingToken?: TestingMockAccessTokenKeys;
  unauthenticated?: boolean;
};

const TESTING_MOCK_ACCESS_TOKEN: Record<TestingMockAccessTokenKeys, string> = {
  ADMIN: process.env.ADMIN_ACCESS_TOKEN || '',
  MEMBER: process.env.MEMBER_ACCESS_TOKEN || '',
};

export const makeTypedGraphqlRequest = async <
  TData = unknown,
  TVariables = Record<string, unknown>,
>(
  path: ApiPath,
  document: TypedDocumentNode<TData, TVariables>,
  variables?: TVariables,
  options?: MakeGraphqlRequestOptions,
): Promise<CommonResponseBody<TData>> => {
  const {
    authenticationToken,
    testingToken,
    unauthenticated,
  }: MakeGraphqlRequestOptions = {
    unauthenticated: false,
    testingToken: 'ADMIN',
    ...options,
  };

  const client = request(`http://localhost:${process.env.APP_PORT}`).post(`/${path}`);

  if (!unauthenticated) {
    const token = TESTING_MOCK_ACCESS_TOKEN[testingToken!];
    client.set('Authorization', `Bearer ${authenticationToken ?? token}`);
  }

  const response = await client.send({
    query: print(document),
    variables: variables || {},
  });

  return {
    data: response.body.data as TData,
    errors: response.body.errors,
    rawResponse: response,
  };
}; 