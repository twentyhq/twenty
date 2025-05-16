import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

type FindOneOperationArgs = Parameters<typeof findOneOperationFactory>[0] & {
  expectToFail?: boolean;
};
export const findOneOperation = async ({
  gqlFields = 'id',
  objectMetadataSingularName,
  expectToFail = false,
  filter,
}: FindOneOperationArgs): CommonResponseBody<{
  findResponse: ObjectRecord;
}> => {
  const graphqlOperation = findOneOperationFactory({
    objectMetadataSingularName,
    gqlFields,
    filter,
  });

  const response = await makeGraphqlAPIRequest(graphqlOperation);

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Find one operation should have failed but did not',
    });
  }

  if (response.body.errors) {
    console.log(response.body.errors);
  }

  console.log(response.body.data);
  return {
    data: {
      findResponse: response.body.data[objectMetadataSingularName],
    },
    errors: response.body.errors,
  };
};
