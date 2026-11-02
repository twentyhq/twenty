import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { mergeManyOperationFactory } from 'test/integration/graphql/utils/merge-many-operation-factory.util';
import { v4 } from 'uuid';

describe('merge on restricted objects (integration)', () => {
  it('should refuse merging records of a system object', async () => {
    const response = await makeGraphqlApiRequest(
      mergeManyOperationFactory({
        objectMetadataPluralName: 'workspaceMembers',
        gqlFields: 'id',
        ids: [v4(), v4()],
        conflictPriorityIndex: 0,
      }),
    );

    expect(response.body.errors[0].message).toBe(
      "Merge is not available on system object 'workspaceMember'.",
    );
  });

  it('should refuse merging dashboards', async () => {
    const response = await makeGraphqlApiRequest(
      mergeManyOperationFactory({
        objectMetadataPluralName: 'dashboards',
        gqlFields: 'id',
        ids: [v4(), v4()],
        conflictPriorityIndex: 0,
      }),
    );

    expect(response.body.errors[0].extensions.userFriendlyMessage).toBe(
      'Merging dashboards is not allowed.',
    );
  });
});
