import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { type ObjectRecord } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

type UpdateOneOperationArgs<TInput> = PerformMetadataQueryParams<TInput> & {
  objectMetadataSingularName: string;
  recordId: string;
};

export const updateOneOperation = async <TInput extends object>({
  input,
  gqlFields = 'id',
  objectMetadataSingularName,
  recordId,
  expectToFail = false,
  token,
}: UpdateOneOperationArgs<TInput>): CommonResponseBody<{
  updateOneResponse: ObjectRecord;
}> => {
  const graphqlOperation = updateOneOperationFactory({
    objectMetadataSingularName,
    gqlFields,
    recordId,
    data: input,
  });

  const response = await makeGraphqlApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Update one operation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Update one operation has failed but should not',
    });
  }

  return {
    data: {
      updateOneResponse:
        response.body.data?.[`update${capitalize(objectMetadataSingularName)}`],
    },
    errors: response.body.errors,
  };
};
