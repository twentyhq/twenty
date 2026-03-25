import {
  type UpdateOneFieldFactoryInput,
  updateOneFieldMetadataQueryFactory,
} from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const updateOneFieldMetadata = async ({
  input,
  gqlFields,
  expectToFail,
}: PerformMetadataQueryParams<UpdateOneFieldFactoryInput>): CommonResponseBody<{
  updateOneField: FieldMetadataEntity;
}> => {
  const graphqlOperation = updateOneFieldMetadataQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Field Metadata update should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      errorMessage: 'Field metadata update should not have failed',
      response,
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
