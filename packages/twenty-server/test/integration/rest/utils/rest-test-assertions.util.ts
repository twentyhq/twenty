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
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toBeDefined();

  if (response.body.error || response.body.errors) {
    throw new Error(
      `Expected successful response but got errors: ${JSON.stringify(response.body)}`,
    );
  }
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
