import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { assertMetadataRestListResponse } from 'test/integration/rest/utils/rest-test-assertions.util';

const EMPTY_PARENT_ID = '00000000-0000-4000-8000-000000000000';

describe('Metadata REST list contract', () => {
  it.each([
    '/metadata/objects',
    '/metadata/fields',
    '/metadata/webhooks',
    '/metadata/apiKeys',
    '/metadata/views',
    '/metadata/viewFields',
    '/metadata/viewFilters',
    '/metadata/viewSorts',
    '/metadata/viewGroups',
    '/metadata/viewFilterGroups',
    '/metadata/pageLayouts',
    `/metadata/pageLayoutTabs?pageLayoutId=${EMPTY_PARENT_ID}`,
    `/metadata/pageLayoutWidgets?pageLayoutTabId=${EMPTY_PARENT_ID}`,
  ])('returns the unified page envelope from GET %s', async (path) => {
    const response = await makeRestAPIRequest({
      method: 'get',
      path,
      bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    assertMetadataRestListResponse(response);
  });

  it('keeps deprecated non-metadata aliases as raw arrays', async () => {
    for (const path of ['/webhooks', '/apiKeys']) {
      const response = await makeRestAPIRequest({
        method: 'get',
        path,
        bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    }
  });
});
