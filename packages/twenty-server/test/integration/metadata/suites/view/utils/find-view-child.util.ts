import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { findViewChildQueryFactory } from 'test/integration/metadata/suites/view/utils/find-view-child-query-factory.util';

export const findViewChild = async ({
  oneQueryName,
  childId,
  token,
}: {
  oneQueryName: string;
  childId: string;
  token?: string;
}): Promise<{ child: { id: string } | null; errorCode?: string }> => {
  const response = await makeMetadataApiRequest(
    findViewChildQueryFactory({ oneQueryName, childId }),
    token,
  );

  return {
    child: response.body.data?.[oneQueryName] ?? null,
    errorCode: response.body.errors?.[0]?.extensions?.code,
  };
};
