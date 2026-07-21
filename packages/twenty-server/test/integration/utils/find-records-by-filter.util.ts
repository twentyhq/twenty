import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

export const findRecordNodesByFilter = async <TNode>(
  objectMetadataSingularName: string,
  objectMetadataPluralName: string,
  gqlFields: string,
  filter: object,
): Promise<TNode[]> => {
  const response = await makeGraphqlAPIRequest(
    findManyOperationFactory({
      objectMetadataSingularName,
      objectMetadataPluralName,
      gqlFields,
      filter,
    }),
  );

  if (response.body.errors?.length) {
    throw new Error(
      `findRecordNodesByFilter(${objectMetadataPluralName}) failed: ${response.body.errors
        .map((error: { message: string }) => error.message)
        .join('; ')}`,
    );
  }

  return response.body.data[objectMetadataPluralName].edges.map(
    (edge: { node: TNode }) => edge.node,
  );
};

export const findRecordIdsByFilter = async (
  objectMetadataSingularName: string,
  objectMetadataPluralName: string,
  filter: object,
): Promise<string[]> => {
  const nodes = await findRecordNodesByFilter<{ id: string }>(
    objectMetadataSingularName,
    objectMetadataPluralName,
    'id',
    filter,
  );

  return nodes.map((node) => node.id);
};
