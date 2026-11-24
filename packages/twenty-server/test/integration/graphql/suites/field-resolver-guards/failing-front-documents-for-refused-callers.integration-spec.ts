import { FRONT_DOCUMENT_CALLERS } from 'test/integration/graphql/suites/field-resolver-guards/utils/front-document-callers.util';
import { expectNotInternalServerErrorsSnapshot } from 'test/integration/graphql/utils/expect-not-internal-server-errors-snapshot.util';
import { readFrontMetadataDocument } from 'test/integration/graphql/utils/read-front-metadata-document.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

// currentUser refuses an API key and an unbound application token; a user-bound
// application token gets through it and is refused by the user session fields
const CALLERS_GET_CURRENT_USER_REFUSES = [
  FRONT_DOCUMENT_CALLERS.apiKey,
  FRONT_DOCUMENT_CALLERS.userBoundApplicationToken,
  FRONT_DOCUMENT_CALLERS.unboundApplicationToken,
];

describe('The GetCurrentUser document of twenty-front should fail', () => {
  it.each(CALLERS_GET_CURRENT_USER_REFUSES)(
    'should refuse $title',
    async ({ arrange }) => {
      const caller = await arrange();

      try {
        const response = await makeMetadataApiRequest(
          { query: readFrontMetadataDocument('GetCurrentUser') },
          caller.token,
        );

        expect(response.body.data).toBeNull();
        expectNotInternalServerErrorsSnapshot({
          errors: response.body.errors,
        });
      } finally {
        await caller.cleanup();
      }
    },
  );
});
