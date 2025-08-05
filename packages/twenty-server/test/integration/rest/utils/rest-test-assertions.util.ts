export interface RestResponse {
  status: number;
  body: any;
}

export const assertRestApiSuccessfulResponse = (
  response: RestResponse,
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

export const assertRestApiErrorResponse = (
  response: RestResponse,
  expectedStatus = 400,
  expectedErrorMessage?: string,
) => {
  expect(response.status).toBe(expectedStatus);

  if (expectedErrorMessage && response.body.message) {
    expect(response.body.message).toContain(expectedErrorMessage);
  }
};
