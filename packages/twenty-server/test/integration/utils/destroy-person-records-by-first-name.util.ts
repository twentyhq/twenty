import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

export const destroyPersonRecordsByFirstName = async (firstName: string) => {
  const destroyResponse = await makeGraphqlApiRequest(
    destroyManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id',
      filter: {
        and: [
          { name: { firstName: { eq: firstName } } },
          {
            or: [
              { deletedAt: { is: 'NULL' } },
              { deletedAt: { is: 'NOT_NULL' } },
            ],
          },
        ],
      },
    }),
  );

  expect(destroyResponse.body.errors).toBeUndefined();
};
