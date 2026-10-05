export interface RestResponse<T = Record<string, unknown>> {
  status: number;
  body: T & {
    error?: string;
    errors?: string[] | Record<string, unknown>[];
    message?: string;
  };
}

export const assertRestApiSuccessfulResponse = <T = Record<string, unknown>>(
  response: RestResponse<T>,
  expectedStatus = 200,
) => {
  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus}, received ${response.status}: ${JSON.stringify(response.body)}`,
    );
  }

  expect(response.status).toBe(expectedStatus);
  expect(response.body).toBeDefined();

  if (response.body.error || response.body.errors) {
    throw new Error(
      `Expected successful response but got errors: ${JSON.stringify(response.body)}`,
    );
  }
};

export const assertMetadataRestListResponse = <T>(
  response: RestResponse<{
    data: T[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
    totalCount: number;
  }>,
): T[] => {
  assertRestApiSuccessfulResponse(response);
  expect(Array.isArray(response.body.data)).toBe(true);
  expect(response.body.pageInfo).toEqual({
    hasNextPage: expect.any(Boolean),
    hasPreviousPage: expect.any(Boolean),
    startCursor: response.body.data.length > 0 ? expect.any(String) : null,
    endCursor: response.body.data.length > 0 ? expect.any(String) : null,
  });
  expect(response.body.totalCount).toEqual(expect.any(Number));

  return response.body.data;
};

export const assertRestApiErrorResponse = <T = Record<string, unknown>>(
  response: RestResponse<T>,
  expectedStatus = 400,
  expectedErrorMessage?: string,
) => {
  expect(response.status).toBe(expectedStatus);

  if (expectedErrorMessage && response.body.message) {
    expect(response.body.message).toContain(expectedErrorMessage);
  }
};

export const assertRestApiErrorNotFoundResponse = (
  response: RestResponse<{ statusCode: number; messages: [] }>,
  expectedStatus = 404,
  expectedErrorMessage?: string,
) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body.statusCode).toBe(expectedStatus);

  if (expectedErrorMessage && response.body.message) {
    expect(response.body.message).toContain(expectedErrorMessage);
  }
};
