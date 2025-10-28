import {
  type FindManyObjectMetadataFactoryInput,
  findManyObjectMetadataQueryFactory,
} from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';

export const findManyObjectMetadata = async ({
  input,
  gqlFields,
  expectToFail,
}: PerformMetadataQueryParams<FindManyObjectMetadataFactoryInput>): Promise<{
  errors: BaseGraphQLError[];
  objects: (ObjectMetadataDTO & { fieldsList?: FieldMetadataDTO[] })[];
}> => {
  const graphqlOperation = findManyObjectMetadataQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Object Metadata retrieval should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Object Metadata retrieval has failed but should not',
    });
  }

  return {
    errors: response.body.errors,
    objects: response.body.data.objects?.edges.map(
      ({ node }: { node: unknown }) => node,
    ),
  };
};
