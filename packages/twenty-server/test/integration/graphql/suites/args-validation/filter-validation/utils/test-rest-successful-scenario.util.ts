import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';

export const testRestSuccessfulScenario = async (
  objectMetadataPluralName: string,
  filter: any,
  validateFilter: (record: Record<string, any>) => boolean,
) => {
  const response = await makeRestAPIRequest({
    method: 'get',
    path: `/${objectMetadataPluralName}`,
    queryParams: `filter=${filter}`,
  });

  const records = response.body.data.testObjects;

  expect(response.body.errors).toBeUndefined();

  expect(records.length).toBeGreaterThan(0);

  expect(
    records.every((record: Record<string, any>) => validateFilter?.(record)),
  ).toBe(true);
};
