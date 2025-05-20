import {
  FindManyObjectMetadataFactoryInput,
  findManyObjectMetadataQueryFactory,
} from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';

export const findManyObjectMetadata = async ({
  input,
  gqlFields,
  expectToFail = false,
}: PerformMetadataQueryParams<FindManyObjectMetadataFactoryInput>): Promise<{
  errors: BaseGraphQLError[];
  objects: ObjectMetadataDTO[];
}> => {
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

  return {
    errors: response.body.errors,
    objects: response.body.data.objects?.edges.map(
      ({ node }: { node: unknown }) => node,
    ),
  };
};
