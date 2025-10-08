import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';

export const testRestFailingScenario = async (
  objectMetadataPluralName: string,
  filter: any,
  errorMessage: string,
) => {
  const response = await makeRestAPIRequest({
    method: 'get',
    path: `/${objectMetadataPluralName}`,
    queryParams: `filter=${filter}`,
  });

  expect(response.body.error).toBeDefined();
  expect(JSON.stringify(response.body.messages)).toContain(errorMessage);
};
