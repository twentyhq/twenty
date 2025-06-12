import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  UpdateOneObjectFactoryInput,
  updateOneObjectMetadataQueryFactory,
} from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata-query-factory.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { PerformMetadataQueryParams } from 'test/integration/types/perform-metadata-query.type';

export const updateOneObjectMetadata = async ({
  input,
  gqlFields,
  expectToFail = false,
}: PerformMetadataQueryParams<UpdateOneObjectFactoryInput>) => {
  const operation = updateOneObjectMetadataQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeGraphqlAPIRequest<{
    updateOneObject: ObjectRecord;
  }>({ operation });

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Object Metadata update should have failed but did not',
    });
  }

  return response;
};
