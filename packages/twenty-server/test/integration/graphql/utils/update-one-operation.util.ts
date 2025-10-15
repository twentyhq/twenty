import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { type ObjectRecord } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

type UpdateOneOperationArgs<T> = PerformMetadataQueryParams<T> & {
  objectMetadataSingularName: string;
  recordId: string;
};
export const updateOneOperation = async <T = object>({
  input,
  gqlFields = 'id',
  objectMetadataSingularName,
  expectToFail = false,
  recordId,
}: UpdateOneOperationArgs<T>): CommonResponseBody<{
  updateOneResponse: ObjectRecord;
}> => {
  const graphqlOperation = updateOneOperationFactory({
    data: input as object, // TODO default generic does not work
    objectMetadataSingularName,
    gqlFields,
    recordId,
  });

  const response = await makeGraphqlAPIRequest(graphqlOperation);

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Update one operation should have failed but did not',
    });
  }

  return {
    data: {
      updateOneResponse:
        response.body.data[`update${capitalize(objectMetadataSingularName)}`],
    },
    errors: response.body.errors,
  };
};
