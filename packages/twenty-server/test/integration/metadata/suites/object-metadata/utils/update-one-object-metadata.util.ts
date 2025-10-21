import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  type UpdateOneObjectFactoryInput,
  updateOneObjectMetadataQueryFactory,
} from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';

export const updateOneObjectMetadata = async ({
  input,
  gqlFields,
  expectToFail,
}: PerformMetadataQueryParams<UpdateOneObjectFactoryInput>): CommonResponseBody<{
  updateOneObject: ObjectMetadataDTO;
}> => {
  const graphqlOperation = updateOneObjectMetadataQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeGraphqlAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Object Metadata update should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Object Metadata update has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
