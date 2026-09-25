import {
  type CheckoutSessionFactoryInput,
  checkoutSessionQueryFactory,
} from 'test/integration/graphql/suites/user-session/utils/checkout-session-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type BillingSessionDTO } from 'src/engine/core-modules/billing/dtos/billing-session.dto';

export const checkoutSession = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<CheckoutSessionFactoryInput>): CommonResponseBody<{
  checkoutSession: BillingSessionDTO;
}> => {
  const response = await makeMetadataAPIRequest(
    checkoutSessionQueryFactory({ input }),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Opening a checkout session should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Opening a checkout session has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
