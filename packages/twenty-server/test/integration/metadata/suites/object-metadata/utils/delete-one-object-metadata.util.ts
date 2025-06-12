import { PerformMetadataQueryParams } from 'test/integration/graphql/types/perform-metadata-query.type';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  DeleteOneObjectFactoryInput,
  deleteOneObjectMetadataQueryFactory,
} from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata-query-factory.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export const deleteOneObjectMetadata = async ({
  input,
  gqlFields,
  expectToFail = false,
}: PerformMetadataQueryParams<DeleteOneObjectFactoryInput>) => {
  const graphqlOperation = deleteOneObjectMetadataQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeGraphqlAPIRequest<{
    deleteOneObject: ObjectRecord;
  }>({ operation: graphqlOperation });

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Object Metadata deletion should have failed but did not',
    });
  }

  return response;
};
