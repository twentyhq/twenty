import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { capitalize } from 'twenty-shared/utils';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

type CreateOneOperationArgs<T> = PerformMetadataQueryParams<T> & {
  objectMetadataSingularName: string;
};
export const createOneOperation = async <T = object>({
  input,
  gqlFields = 'id',
  objectMetadataSingularName,
  expectToFail = false,
}: CreateOneOperationArgs<T>): CommonResponseBody<{
  createOneResponse: ObjectRecord;
}> => {
  const graphqlOperation = createOneOperationFactory({
    data: input as object, // TODO default generic does not work
    objectMetadataSingularName,
    gqlFields,
  });

  const response = await makeGraphqlAPIRequest(graphqlOperation);

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Create one operation should have failed but did not',
    });
  }

  return {
    data: {
      createOneResponse:
        response.body.data[`create${capitalize(objectMetadataSingularName)}`],
    },
    errors: response.body.errors,
  };
};
