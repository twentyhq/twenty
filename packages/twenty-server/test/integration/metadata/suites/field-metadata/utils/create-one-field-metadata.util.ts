import {
  CreateOneFieldFactoryInput,
  createOneFieldMetadataQueryFactory,
} from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-query-factory.util';
import { PerformMetadataQueryParams } from 'test/integration/types/perform-metadata-query.type';
import { CommonResponseBody } from 'test/integration/types/types/common-response-body.type';
import { makeMetadataAPIRequest } from 'test/integration/utils/make-metadata-api-request.util';
import { warnIfNoErrorButExpectedToFtest } from /integration/types / common - response - body.type - error - but - expected - to - fail.util;
';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const createOneFieldMetadata = async ({
  input,
  gqlFields,
  expectToFail = false,
}: PerformMetadataQueryParams<CreateOneFieldFactoryInput>): CommonResponseBody<{
  createOneField: FieldMetadataEntity;
}> => {
  const graphqlOperation = createOneFieldMetadataQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Field Metadata creation should have failed but did not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
