import { isDefined } from 'twenty-shared/utils';

import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

// Mirrors the chat list: deleted chats stay listed for restore, run conversations are excluded.
export const listChatThreadIds = async (
  token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
): Promise<string[]> => {
  const response = await makeGraphqlApiRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'agentChatThread',
      objectMetadataPluralName: 'agentChatThreads',
      gqlFields: 'id',
      filter: {
        and: [
          { workflowRunId: { is: 'NULL' } },
          {
            or: [
              { deletedAt: { is: 'NULL' } },
              { deletedAt: { is: 'NOT_NULL' } },
            ],
          },
        ],
      },
      orderBy: [{ updatedAt: 'DescNullsLast' }],
      first: 200,
    }),
    token,
  );

  if (isDefined(response.body.errors)) {
    throw new Error(
      `Could not list chats: ${JSON.stringify(response.body.errors)}`,
    );
  }

  return response.body.data.agentChatThreads.edges.map(
    ({ node }: { node: { id: string } }) => node.id,
  );
};
