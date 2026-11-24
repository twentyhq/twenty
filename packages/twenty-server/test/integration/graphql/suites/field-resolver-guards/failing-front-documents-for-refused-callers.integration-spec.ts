import { arrangeWorkspaceCustomApplicationToken } from 'test/integration/graphql/utils/arrange-workspace-custom-application-token.util';
import { expectNotInternalServerErrorsSnapshot } from 'test/integration/graphql/utils/expect-not-internal-server-errors-snapshot.util';
import { readFrontMetadataDocument } from 'test/integration/graphql/utils/read-front-metadata-document.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

// currentUser refuses an API key and an unbound application token; a user-bound
// application token gets through it and is refused by the user session fields
const CALLERS_GET_CURRENT_USER_REFUSES: {
  title: string;
  getToken: () => Promise<string>;
}[] = [
  {
    title: 'an API key',
    getToken: async () => API_KEY_ACCESS_TOKEN,
  },
  {
    title: 'an application token bound to a user',
    getToken: () =>
      arrangeWorkspaceCustomApplicationToken({ isBoundToUser: true }),
  },
  {
    title: 'an application token without user',
    getToken: () =>
      arrangeWorkspaceCustomApplicationToken({ isBoundToUser: false }),
  },
];

describe('The GetCurrentUser document of twenty-front should fail', () => {
  it.each(CALLERS_GET_CURRENT_USER_REFUSES)(
    'should refuse $title',
    async ({ getToken }) => {
      const response = await makeMetadataApiRequest(
        { query: readFrontMetadataDocument('GetCurrentUser') },
        await getToken(),
      );

      expect(response.body.data).toBeNull();
      expectNotInternalServerErrorsSnapshot({ errors: response.body.errors });
    },
  );
});
