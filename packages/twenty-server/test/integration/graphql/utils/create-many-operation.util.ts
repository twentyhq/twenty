import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { type ObjectRecord } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';
import { v4 } from 'uuid';

type CreateManyOperationInput = {
  objectMetadataSingularName: string;
  objectMetadataPluralName: string;
  gqlFields?: string;
  data: object[];
  upsert?: boolean;
  expectToFail?: boolean;
  token?: string;
};

export const createManyOperation = async ({
  objectMetadataSingularName,
  objectMetadataPluralName,
  gqlFields = 'id',
  data,
  upsert = false,
  expectToFail = false,
  token,
}: CreateManyOperationInput): CommonResponseBody<{
  createdRecords: ObjectRecord[];
}> => {
  const graphqlOperation = createManyOperationFactory({
    objectMetadataSingularName,
    objectMetadataPluralName,
    gqlFields,
    data: data.map((item) => ({
      id: v4(),
      ...item,
    })),
    upsert,
  });

  const response = await makeGraphqlAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Create many operation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Create many operation failed but should not have',
    });
  }

  return {
    data: {
      createdRecords:
        response.body.data?.[`create${capitalize(objectMetadataPluralName)}`] ??
        [],
    },
    errors: response.body.errors,
  };
};
