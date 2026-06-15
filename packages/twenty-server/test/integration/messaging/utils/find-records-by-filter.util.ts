import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

export const findRecordIdsByFilter = async (
  objectMetadataSingularName: string,
  objectMetadataPluralName: string,
  filter: object,
): Promise<string[]> => {
  const response = await makeGraphqlAPIRequest(
    findManyOperationFactory({
      objectMetadataSingularName,
      objectMetadataPluralName,
      gqlFields: 'id',
      filter,
    }),
  );

  return response.body.data[objectMetadataPluralName].edges.map(
    (edge: { node: { id: string } }) => edge.node.id,
  );
};
