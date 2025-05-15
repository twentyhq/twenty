import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  UpdateOneFieldFactoryInput,
  updateOneFieldMetadataQueryFactory,
} from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata-query-factory.util';
import { CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const updateOneFieldMetadata = async ({
  input,
  gqlFields,
  expectToFail = false,
}: PerformMetadataQueryParams<UpdateOneFieldFactoryInput>): CommonResponseBody<{
  updateOneField: FieldMetadataEntity;
}> => {
  const graphqlOperation = updateOneFieldMetadataQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeGraphqlAPIRequest(graphqlOperation);

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Field Metadata update should have failed but did not',
    });
  }

  if (response.body.errors) {
    console.log(response.body.errors);
  }

  return { data: response.body.data, errors: response.body.errors };
};
