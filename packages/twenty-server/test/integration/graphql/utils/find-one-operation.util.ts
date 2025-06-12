import { FindOneOperationFactoryParams, findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { CommonResponseBody } from 'test/integration/types/common-response-body.type';
import { makeGraphqlAPIRequest } from 'test/integration/utils/make-graphql-api-request.util';

type FindOneOperationArgs = FindOneOperationFactoryParams & {
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
  const operation = findOneOperationFactory({
    objectMetadataSingularName,
    gqlFields,
    filter,
  });

  const response = await makeGraphqlAPIRequest<Record<string, ObjectRecord>>({
    operation,
  });

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Find one operation should have failed but did not',
    });
  }

  return {
    ...response,
    data: {
      findResponse: response.data[objectMetadataSingularName],
    },
  };
};
