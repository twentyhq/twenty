import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { type ObjectRecord } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

type DestroyOneOperationArgs = {
  objectMetadataSingularName: string;
  recordId: string;
  gqlFields?: string;
  expectToFail?: boolean;
  token?: string;
};

export const destroyOneOperation = async ({
  objectMetadataSingularName,
  recordId,
  gqlFields = 'id',
  expectToFail = false,
  token,
}: DestroyOneOperationArgs): CommonResponseBody<{
  destroyOneResponse: ObjectRecord;
}> => {
  const graphqlOperation = destroyOneOperationFactory({
    objectMetadataSingularName,
    gqlFields,
    recordId,
  });

  const response = await makeGraphqlApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Destroy one operation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Destroy one operation has failed but should not',
    });
  }

  return {
    data: {
      destroyOneResponse:
        response.body.data?.[
          `destroy${capitalize(objectMetadataSingularName)}`
        ],
    },
    errors: response.body.errors,
  };
};
