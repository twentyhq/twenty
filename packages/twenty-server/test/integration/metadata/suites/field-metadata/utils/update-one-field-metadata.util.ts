import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  UpdateOneFieldFactoryInput,
  updateOneFieldMetadataQueryFactory,
} from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata-query-factory.util';
import { PerformMetadataQueryParams } from 'test/integration/types/perform-metadata-query.type';
import { CommonResponseBody } from 'test/integration/types/types/common-response-body.type';
import { warnIfNoErrorButExpectedToFtest } from /integration/types / common - response - body.type - error - but - expected - to - fail.util;
';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

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

  return { data: response.body.data, errors: response.body.errors };
};
