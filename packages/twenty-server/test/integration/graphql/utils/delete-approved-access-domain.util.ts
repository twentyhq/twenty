import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type DeleteApprovedAccessDomainInput } from 'src/engine/core-modules/approved-access-domain/dtos/delete-approved-access-domain.input';

export const deleteApprovedAccessDomain = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<DeleteApprovedAccessDomainInput>): CommonResponseBody<{
  deleteApprovedAccessDomain: boolean;
}> => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        mutation DeleteApprovedAccessDomain(
          $input: DeleteApprovedAccessDomainInput!
        ) {
          deleteApprovedAccessDomain(input: $input)
        }
      `,
      variables: { input },
    },
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Approved access domain deletion should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Approved access domain deletion has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
