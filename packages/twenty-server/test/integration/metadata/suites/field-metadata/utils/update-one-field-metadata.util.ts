import {
  UpdateOneFieldFactoryInput,
  updateOneFieldMetadataQueryFactory,
} from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata-query-factory.util';
import { PerformMetadataQueryParams } from 'test/integration/types/perform-metadata-query.type';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { makeGraphqlAPIRequest } from 'test/integration/utils/make-graphql-api-request.util';

export const updateOneFieldMetadata = async ({
  input,
  gqlFields,
  expectToFail = false,
}: PerformMetadataQueryParams<UpdateOneFieldFactoryInput>) => {
  const operation = updateOneFieldMetadataQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeGraphqlAPIRequest<{
    updateOneField: FieldMetadataEntity;
  }>({ operation });

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Field Metadata update should have failed but did not',
    });
  }

  return response;
};
