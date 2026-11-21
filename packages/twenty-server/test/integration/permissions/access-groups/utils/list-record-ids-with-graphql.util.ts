import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { type AccessTestLogin } from 'test/integration/permissions/access-groups/utils/access-test-login.type';

export const listRecordIdsWithGraphql = async ({
  login,
  objectName,
  ids,
}: {
  login: Pick<AccessTestLogin, 'token'>;
  objectName: 'opportunity' | 'note';
  ids: string[];
}): Promise<string[]> => {
  const response = await makeGraphqlApiRequest(
    findManyOperationFactory({
      objectMetadataSingularName: objectName,
      objectMetadataPluralName:
        objectName === 'opportunity' ? 'opportunities' : 'notes',
      gqlFields: 'id',
      filter: { id: { in: ids } },
    }),
    login.token,
  );

  expect(response.body.errors).toBeUndefined();

  return Object.values<{ edges: { node: { id: string } }[] }>(
    response.body.data,
  )[0]
    .edges.map(({ node }) => node.id)
    .sort();
};
