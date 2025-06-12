import { PerformMetadataQueryParams } from 'test/integration/graphql/types/perform-metadata-query.type';
import { makeMetadataAPIRequest } from 'test/integration/graphql/utils/make-metadata-api-request.util';
import {
  CreateOneObjectFactoryInput,
  createOneObjectMetadataQueryFactory,
} from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-query-factory.util';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const createOneObjectMetadata = async ({
  input,
  gqlFields,
  expectToFail = false,
}: PerformMetadataQueryParams<CreateOneObjectFactoryInput>) => {
  const operation = createOneObjectMetadataQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest<{
    createOneObject: ObjectMetadataEntity;
  }>({ operation });

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Object Metadata creation should have failed but did not',
    });
  }

  return response;
};
