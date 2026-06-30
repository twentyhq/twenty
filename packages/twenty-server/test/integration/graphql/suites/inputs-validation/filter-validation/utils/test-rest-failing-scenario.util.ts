import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';

export const testRestFailingScenario = async (
  objectMetadataPluralName: string,
  filter: any,
) => {
  const encodedFilter = encodeURIComponent(filter);
  const response = await makeRestAPIRequest({
    method: 'get',
    path: `/${objectMetadataPluralName}?filter=${encodedFilter}`,
  });

  expect(response.body.error).toBeDefined();
  expect(response.body.messages).toMatchSnapshot();
};
