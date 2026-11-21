import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

export const createAccessTestRecord = async ({
  objectName,
  data,
}: {
  objectName: string;
  data: object;
}): Promise<string> => {
  const response = await makeGraphqlApiRequest(
    createOneOperationFactory({
      objectMetadataSingularName: objectName,
      gqlFields: 'id',
      data,
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return Object.values<{ id: string }>(response.body.data)[0].id;
};
