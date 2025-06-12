import { PerformMetadataQueryParams } from 'test/integration/graphql/types/perform-metadata-query.type';
import { makeMetadataAPIRequest } from 'test/integration/graphql/utils/make-metadata-api-request.util';
import {
  FindManyObjectMetadataFactoryInput,
  findManyObjectMetadataQueryFactory,
} from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-query-factory.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';

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
  const operation = findManyObjectMetadataQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest<{
    objects: IConnection<ObjectMetadataDTO>;
  }>({
    operation,
  });

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Object Metadata retrieval should have failed but did not',
    });
  }

  return {
    errors: response.errors,
    objects: response.data.objects?.edges.map(({ node }) => node),
  };
};
