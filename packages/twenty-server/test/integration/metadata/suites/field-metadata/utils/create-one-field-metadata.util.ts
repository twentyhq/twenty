import {
  CreateOneFieldFactoryInput,
  createOneFieldMetadataQueryFactory,
} from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';

export const createOneFieldMetadata = async <T extends FieldMetadataType>({
  input,
  gqlFields,
  expectToFail = false,
}: PerformMetadataQueryParams<CreateOneFieldFactoryInput>): CommonResponseBody<{
  createOneField: FieldMetadataDTO<T>;
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
