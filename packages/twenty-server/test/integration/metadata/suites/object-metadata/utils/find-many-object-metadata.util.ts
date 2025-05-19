import {
  FindManyObjectMetadataFactoryInput,
  findManyObjectMetadataQueryFactory,
} from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const findManyObjectMetadata = async ({
  input,
  gqlFields,
  expectToFail = false,
}: PerformMetadataQueryParams<FindManyObjectMetadataFactoryInput>) => {
  const graphqlOperation = findManyObjectMetadataQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Object Metadata retrieval should have failed but did not',
    });
  }

  // @ts-expect-error legacy noImplicitAny
  return response.body.data.objects.edges.map((edge) => edge.node);
};
