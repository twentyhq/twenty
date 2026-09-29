import { randomUUID } from 'crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { BlocklistScope } from 'twenty-shared/types';

import { type BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const createWorkspaceBlocklistEntry = async ({
  token,
}: {
  token?: string;
}): Promise<{
  data: { createBlocklist: { id: string; scope: string } } | undefined;
  errors: BaseGraphQLError[];
}> => {
  const response = await makeGraphqlApiRequest(
    createOneOperationFactory({
      objectMetadataSingularName: 'blocklist',
      gqlFields: `
        id
        scope
      `,
      data: {
        id: randomUUID(),
        handle: `delegated-blocklist-${randomUUID()}@example.com`,
        scope: BlocklistScope.WORKSPACE,
      },
    }),
    token,
  );

  return { data: response.body.data, errors: response.body.errors };
};

export const destroyWorkspaceBlocklistEntry = async (
  blocklistEntryId: string,
): Promise<void> => {
  const response = await makeGraphqlApiRequest(
    destroyOneOperationFactory({
      objectMetadataSingularName: 'blocklist',
      gqlFields: 'id',
      recordId: blocklistEntryId,
    }),
  );

  expect(response.body.errors).toBeUndefined();
};
