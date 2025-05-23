import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  CreateOneObjectFactoryInput,
  createOneObjectMetadataQueryFactory,
} from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

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

  if (response.body.errors) {
    console.log(response.body.errors);
  }
  
  return { data: response.body.data, errors: response.body.errors };
};
