import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { type AccessTestLogin } from 'test/integration/permissions/access-groups/utils/access-test-login.type';

export const listOpportunityIdsWithRest = async ({
  login,
  ids,
}: {
  login: Pick<AccessTestLogin, 'token'>;
  ids: string[];
}): Promise<string[]> => {
  const response = await makeRestApiRequest({
    method: 'get',
    path: `/opportunities?filter=id[in]:[${ids.map((id) => `"${id}"`).join(',')}]`,
    bearer: login.token,
  });

  expect(response.body.error).toBeUndefined();

  return response.body.data.opportunities
    .map(({ id }: { id: string }) => id)
    .sort();
};
