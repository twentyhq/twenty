import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { searchFactory } from 'test/integration/graphql/utils/search-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type SearchArgs } from 'src/engine/core-modules/search/dtos/search-args';
import { type SearchResultConnectionDTO } from 'src/engine/core-modules/search/dtos/search-result-connection.dto';

type SearchOperationArgs = SearchArgs & {
  expectToFail?: boolean;
  accessToken?: string;
};

export const search = async ({
  searchInput,
  limit,
  after,
  includedObjectNameSingulars,
  excludedObjectNameSingulars,
  filter,
  expectToFail,
  accessToken,
}: SearchOperationArgs): CommonResponseBody<{
  search: SearchResultConnectionDTO;
}> => {
  const graphqlOperation = searchFactory({
    searchInput,
    limit,
    after,
    includedObjectNameSingulars,
    excludedObjectNameSingulars,
    filter,
  });

  const response = await makeGraphqlAPIRequest(graphqlOperation, accessToken);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Search should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Search has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
