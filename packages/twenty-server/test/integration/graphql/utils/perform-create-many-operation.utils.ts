import { randomUUID } from 'crypto';

import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { capitalize } from 'twenty-shared/utils';

export const performCreateManyOperation = async (
  objectMetadataSingularName: string,
  objectMetadataPluralName: string,
  gqlFields: string,
  data: object[],
) => {
  const response = await makeGraphqlAPIRequest(
    createManyOperationFactory({
      objectMetadataSingularName,
      objectMetadataPluralName,
      gqlFields,
      data: data.map((item) => ({
        id: randomUUID(),
        ...item,
      })),
    }),
  );

  return response.body.data[`create${capitalize(objectMetadataPluralName)}`];
};
