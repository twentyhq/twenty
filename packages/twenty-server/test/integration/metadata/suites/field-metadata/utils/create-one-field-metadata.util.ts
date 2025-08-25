import {
  type CreateOneFieldFactoryInput,
  createOneFieldMetadataQueryFactory,
} from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { type FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';

export const createOneFieldMetadata = async <T extends FieldMetadataType>({
  input,
  gqlFields,
  expectToFail,
}: PerformMetadataQueryParams<CreateOneFieldFactoryInput>): CommonResponseBody<{
  createOneField: FieldMetadataDTO<T>;
}> => {
  const graphqlOperation = createOneFieldMetadataQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Field Metadata creation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      errorMessage: 'Field metadata creation should not have failed',
      response,
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
