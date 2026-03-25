import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';

export const testRestSuccessfulScenario = async (
  objectMetadataPluralName: string,
  filter: any,
  validateFilter: (record: Record<string, any>) => boolean,
) => {
  const encodedFilter = encodeURIComponent(filter);
  const response = await makeRestAPIRequest({
    method: 'get',
    path: `/${objectMetadataPluralName}?filter=${encodedFilter}`,
  });

  if (response.body.error || response.body.messages) {
    throw new Error(
      `REST API error: ${response.body.error} - ${JSON.stringify(response.body.messages)}`,
    );
  }

  expect(response.body.data).toBeDefined();

  const records = response.body.data[objectMetadataPluralName];

  expect(response.body.errors).toBeUndefined();

  expect(records.length).toBeGreaterThan(0);

  expect(
    records.every((record: Record<string, any>) => validateFilter?.(record)),
  ).toBe(true);
};
