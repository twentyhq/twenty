import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  DeleteOneFieldFactoryInput,
  deleteOneFieldMetadataQueryFactory,
} from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata-query-factory.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { PerformMetadataQueryParams } from 'test/integration/types/perform-metadata-query.type';
import { makeGraphqlAPIRequest } from 'test/integration/utils/make-graphql-api-request.util';

export const deleteOneFieldMetadata = async ({
  input,
  gqlFields,
  expectToFail = false,
}: PerformMetadataQueryParams<DeleteOneFieldFactoryInput>) => {
  const graphqlOperation = deleteOneFieldMetadataQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeGraphqlAPIRequest<{
    deleteOneField: FieldMetadataEntity;
  }>({ operation: graphqlOperation });

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Field Metadata deletion should have failed but did not',
    });
  }

  return response;
};
