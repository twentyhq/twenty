import gql from 'graphql-tag';
import { callMcpTool } from 'test/integration/graphql/suites/application-role-intersection/utils/call-mcp-tool.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { ViewSortDirection } from 'twenty-shared/types';

const upsertCompleteViewThroughMcp = async (
  toolArguments: Record<string, unknown>,
): Promise<{ id: string }> => {
  const result = await callMcpTool({
    toolName: 'execute_tool',
    toolArguments: {
      toolName: 'upsert_complete_view',
      arguments: toolArguments,
    },
    token: API_KEY_ACCESS_TOKEN,
  });

  expect(result.isError).toBe(false);

  return JSON.parse(result.content[0].text);
};

// upsert_complete_view replaces sorts wholesale, so re-saving a sort on the
// same field deletes the old row and creates a new one in a single migration,
// which must not trip the (fieldMetadataId, viewId) unique index or the
// duplicate-sort validation.
describe('View Sort replacement should succeed', () => {
  let createdViewId: string | undefined;

  afterAll(async () => {
    if (createdViewId) {
      await destroyOneView({ expectToFail: false, viewId: createdViewId });
    }
  });

  it('should replace a sort with another one on the same field', async () => {
    const createdView = await upsertCompleteViewThroughMcp({
      objectNameSingular: 'company',
      name: 'Test View For View Sort Replacement',
      sorts: [{ fieldName: 'name', direction: ViewSortDirection.ASC }],
    });

    createdViewId = createdView.id;
    jestExpectToBeDefined(createdViewId);

    await upsertCompleteViewThroughMcp({
      id: createdViewId,
      sorts: [{ fieldName: 'name', direction: ViewSortDirection.DESC }],
    });

    const response = await makeMetadataApiRequest({
      query: gql`
        query GetViewSorts($viewId: String) {
          getViewSorts(viewId: $viewId) {
            id
            direction
          }
        }
      `,
      variables: { viewId: createdViewId },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getViewSorts).toEqual([
      expect.objectContaining({ direction: ViewSortDirection.DESC }),
    ]);
  });
});
