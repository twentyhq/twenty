import { randomUUID } from 'crypto';

import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { CommonResponseBody } from 'test/integration/types/common-response-body.type';
import { capitalize } from 'twenty-shared/utils';

export const performCreateManyOperation = async (
  objectMetadataSingularName: string,
  objectMetadataPluralName: string,
  gqlFields: string,
  data: object[],
): CommonResponseBody<{ createManyResponse: unknown }> => {
  const operation = createManyOperationFactory({
    objectMetadataSingularName,
    objectMetadataPluralName,
    gqlFields,
    data: data.map((item) => ({
      id: randomUUID(),
      ...item,
    })),
  });
  const response = await makeGraphqlAPIRequest<Record<string, unknown>>({
    operation,
  });

  return {
    ...response,
    data: {
      createManyResponse:
        response.data[`create${capitalize(objectMetadataPluralName)}`],
    },
  };
};
