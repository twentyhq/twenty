import {
  type CreateOneObjectFactoryInput,
  createOneObjectMetadataQueryFactory,
} from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';

export const createOneObjectMetadata = async ({
  input,
  gqlFields,
  expectToFail = false,
}: PerformMetadataQueryParams<CreateOneObjectFactoryInput>): CommonResponseBody<{
  createOneObject: ObjectMetadataDTO;
}> => {
  const graphqlOperation = createOneObjectMetadataQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Object Metadata creation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Object Metadata creation has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
