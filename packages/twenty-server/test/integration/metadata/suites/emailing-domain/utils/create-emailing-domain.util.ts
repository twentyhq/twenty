import { createEmailingDomainQueryFactory } from 'test/integration/metadata/suites/emailing-domain/utils/create-emailing-domain-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type CreateEmailingDomainInput } from 'src/engine/core-modules/emailing-domain/dtos/create-emailing-domain.input';
import { type EmailingDomainDTO } from 'src/engine/core-modules/emailing-domain/dtos/emailing-domain.dto';

export const createEmailingDomain = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<CreateEmailingDomainInput>): CommonResponseBody<{
  createEmailingDomain: EmailingDomainDTO;
}> => {
  const graphqlOperation = createEmailingDomainQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Emailing domain creation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Emailing domain creation has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
