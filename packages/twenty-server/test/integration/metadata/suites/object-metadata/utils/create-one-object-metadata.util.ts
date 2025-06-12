import {
  CreateOneObjectFactoryInput,
  createOneObjectMetadataQueryFactory,
} from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-query-factory.util';
import { PerformMetadataQueryParams } from 'test/integration/types/perform-metadata-query.type';
import { CommonResponseBody } from 'test/integration/types/types/common-response-body.type';
import { makeMetadataAPIRequest } from 'test/integration/utils/make-metadata-api-request.util';
import { warnIfNoErrorButExpectedToFtest } from /integration/types / common - response - body.type - error - but - expected - to - fail.util;
';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export const createOneObjectMetadata = async ({
  input,
  gqlFields,
  expectToFail = false,
}: PerformMetadataQueryParams<CreateOneObjectFactoryInput>): CommonResponseBody<{
  createOneObject: ObjectMetadataEntity; // not accurate
}> => {
  const graphqlOperation = createOneObjectMetadataQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Object Metadata creation should have failed but did not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
