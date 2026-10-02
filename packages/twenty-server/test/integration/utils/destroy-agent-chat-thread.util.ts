import { isDefined } from 'twenty-shared/utils';

import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

export const destroyAgentChatThread = async ({
  threadId,
  token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
}: {
  threadId: string;
  token?: string;
}): Promise<void> => {
  const response = await makeGraphqlApiRequest(
    destroyOneOperationFactory({
      objectMetadataSingularName: 'agentChatThread',
      gqlFields: 'id',
      recordId: threadId,
    }),
    token,
  );

  if (isDefined(response.body.errors)) {
    throw new Error(
      `Could not destroy chat ${threadId}: ${JSON.stringify(response.body.errors)}`,
    );
  }
};
