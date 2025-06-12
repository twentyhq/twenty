import { ASTNode, print } from 'graphql';
import request from 'supertest';
import { CommonResponseBody } from 'test/integration/graphql/types/common-response-body.type';

type GraphqlOperation = {
  query: ASTNode;
  variables?: Record<string, unknown>;
};

export const TESTING_MOCK_ACCESS_TOKEN = {
  ADMIN:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC05ZTNiLTQ2ZDQtYTU1Ni04OGI5ZGRjMmIwMzQiLCJ3b3Jrc3BhY2VJZCI6IjIwMjAyMDIwLTFjMjUtNGQwMi1iZjI1LTZhZWNjZjdlYTQxOSIsIndvcmtzcGFjZU1lbWJlcklkIjoiMjAyMDIwMjAtMDY4Ny00YzQxLWI3MDctZWQxYmZjYTk3MmE3IiwidXNlcldvcmtzcGFjZUlkIjoiMjAyMDIwMjAtOWUzYi00NmQ0LWE1NTYtODhiOWRkYzJiMDM1IiwiaWF0IjoxNzM5NTQ3NjYxLCJleHAiOjMzMjk3MTQ3NjYxfQ.fbOM9yhr3jWDicPZ1n771usUURiPGmNdeFApsgrbxOw',
  EXPIRED:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC05ZTNiLTQ2ZDQtYTU1Ni04OGI5ZGRjMmIwMzQiLCJ3b3Jrc3BhY2VJZCI6IjIwMjAyMDIwLTFjMjUtNGQwMi1iZjI1LTZhZWNjZjdlYTQxOSIsIndvcmtzcGFjZU1lbWJlcklkIjoiMjAyMDIwMjAtMDY4Ny00YzQxLWI3MDctZWQxYmZjYTk3MmE3IiwiaWF0IjoxNzM4MzIzODc5LCJleHAiOjE3MzgzMjU2Nzl9.m73hHVpnw5uGNGrSuKxn6XtKEUK3Wqkp4HsQdYfZiHo',
  INVALID:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC05ZTNiLTQ2ZDQtYTU1Ni04OGI5ZGRjMmIwMzQiLCJ3b3Jrc3BhY2VJZCI6IjIwMjAyMDIwLTFjMjUtNGQwMi1iZjI1LTZhZWNjZjdlYTQxOSIsIndvcmtzcGFjZU1lbWJlcklkIjoiMjAyMDIwMjAtMDY4Ny00YzQxLWI3MDctZWQxYmZjYTk3MmE3IiwiaWF0IjoxNzM4MzIzODc5LCJleHAiOjE3MzgzMjU2Nzl9.m73hHVpnw5uGNGrSuKxn6XtKEUK3Wqkp4HsQdYfZiHp',
  MEMBER:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC0zOTU3LTQ5MDgtOWMzNi0yOTI5YTIzZjgzNTciLCJ3b3Jrc3BhY2VJZCI6IjIwMjAyMDIwLTFjMjUtNGQwMi1iZjI1LTZhZWNjZjdlYTQxOSIsIndvcmtzcGFjZU1lbWJlcklkIjoiMjAyMDIwMjAtNzdkNS00Y2I2LWI2MGEtZjRhODM1YTg1ZDYxIiwidXNlcldvcmtzcGFjZUlkIjoiMjAyMDIwMjAtMzk1Ny00OTA4LTljMzYtMjkyOWEyM2Y4MzUzIiwiaWF0IjoxNzM5NDU5NTcwLCJleHAiOjMzMjk3MDU5NTcwfQ.Er7EEU4IP4YlGN79jCLR_6sUBqBfKx2M3G_qGiDpPRo',
  GUEST:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC03MTY5LTQyY2YtYmM0Ny0xY2ZlZjE1MjY0YjgiLCJ3b3Jrc3BhY2VJZCI6IjIwMjAyMDIwLTFjMjUtNGQwMi1iZjI1LTZhZWNjZjdlYTQxOSIsIndvcmtzcGFjZU1lbWJlcklkIjoiMjAyMDIwMjAtMTU1My00NWM2LWEwMjgtNWE5MDY0Y2NlMDdmIiwidXNlcldvcmtzcGFjZUlkIjoiMjAyMDIwMjAtNzE2OS00MmNmLWJjNDctMWNmZWYxNTI2NGIxIiwiaWF0IjoxNzM5ODg4NDcwLCJleHAiOjMzMjk3NDg4NDcwfQ.0NEu-AWGv3l77rs-56Z5Gt0UTU7HDl6qUTHUcMWNrCc',
  API_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJ0eXBlIjoiQVBJX0tFWSIsIndvcmtzcGFjZUlkIjoiMjAyMDIwMjAtMWMyNS00ZDAyLWJmMjUtNmFlY2NmN2VhNDE5IiwiaWF0IjoxNzQ0OTgzNzUwLCJleHAiOjQ4OTg1ODM2OTMsImp0aSI6IjIwMjAyMDIwLWY0MDEtNGQ4YS1hNzMxLTY0ZDAwN2MyN2JhZCJ9.4xkkwz_uu2xzs_V8hJSaM15fGziT5zS3vq2lM48OHr0',
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
