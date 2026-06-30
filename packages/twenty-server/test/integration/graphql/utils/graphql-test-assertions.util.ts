import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import {
  type BaseGraphQLError,
  type ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export interface GraphQLResponse<T extends Record<string, unknown>> {
  status: number;
  body: {
    data?: T;
    errors?: BaseGraphQLError[];
  };
}

export const assertGraphQLSuccessfulResponse = <
  T extends Record<string, unknown>,
>(
  response: GraphQLResponse<T>,
  expectedData?: Partial<T>,
) => {
  expect(response.status).toBe(200);
  expect(response.body.data).toBeDefined();
  expect(response.body.errors).toBeUndefined();

  if (expectedData) {
    expect(response.body.data).toMatchObject(expectedData);
  }
};

export const assertGraphQLErrorResponse = <T extends Record<string, unknown>>(
  response: GraphQLResponse<T>,
  expectedErrorCode: ErrorCode,
  expectedErrorMessage?: string,
) => {
  expect(response.status).toBe(200);
  expect(response.body.errors).toBeDefined();
  expect(response.body.errors).toHaveLength(1);

  if (expectedErrorCode && response.body.errors) {
    expect(response.body.errors[0].extensions?.code).toBe(expectedErrorCode);
  }

  if (expectedErrorMessage && response.body.errors) {
    expect(response.body.errors[0].message).toBe(expectedErrorMessage);
  }
};

export const assertGraphQLErrorResponseWithSnapshot = <
  T extends Record<string, unknown>,
>(
  response: GraphQLResponse<T>,
) => {
  expect(response.status).toBe(200);
  jestExpectToBeDefined(response.body.errors);
  expect(response.body.errors).toHaveLength(1);

  const firstError = response.body.errors[0];

  jestExpectToBeDefined(firstError);
  expect(firstError).toMatchSnapshot(
    extractRecordIdsAndDatesAsExpectAny(firstError),
  );
};
