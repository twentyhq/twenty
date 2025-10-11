import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';

export const testRestFailingScenario = async (
  objectMetadataPluralName: string,
  input: any,
  errorMessage: string,
) => {
  const response = await makeRestAPIRequest({
    method: 'post',
    path: `/${objectMetadataPluralName}`,
    body: input,
  });

  expect(response.body.error).toBeDefined();
  expect(JSON.stringify(response.body.messages)).toContain(errorMessage);
};
