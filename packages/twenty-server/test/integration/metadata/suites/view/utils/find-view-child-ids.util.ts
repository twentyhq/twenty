import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { findAllViewChildrenQueryFactory } from 'test/integration/metadata/suites/view/utils/find-all-view-children-query-factory.util';
import { findViewChildrenByViewIdQueryFactory } from 'test/integration/metadata/suites/view/utils/find-view-children-by-view-id-query-factory.util';
import { isDefined } from 'twenty-shared/utils';

export const findViewChildIds = async ({
  listQueryName,
  viewId,
  token,
}: {
  listQueryName: string;
  viewId?: string;
  token?: string;
}): Promise<string[]> => {
  const graphqlOperation = isDefined(viewId)
    ? findViewChildrenByViewIdQueryFactory({ listQueryName, viewId })
    : findAllViewChildrenQueryFactory({ listQueryName });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  expect(response.body.errors).toBeUndefined();

  return response.body.data[listQueryName].map(({ id }: { id: string }) => id);
};
