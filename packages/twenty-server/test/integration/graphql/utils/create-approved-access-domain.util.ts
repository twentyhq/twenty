import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ApprovedAccessDomainDTO } from 'src/engine/core-modules/approved-access-domain/dtos/approved-access-domain.dto';
import { type CreateApprovedAccessDomainInput } from 'src/engine/core-modules/approved-access-domain/dtos/create-approved-access.domain.input';

export const createApprovedAccessDomain = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<CreateApprovedAccessDomainInput>): CommonResponseBody<{
  createApprovedAccessDomain: ApprovedAccessDomainDTO;
}> => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        mutation CreateApprovedAccessDomain(
          $input: CreateApprovedAccessDomainInput!
        ) {
          createApprovedAccessDomain(input: $input) {
            id
            domain
            isValidated
          }
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
        'Approved access domain creation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Approved access domain creation has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
