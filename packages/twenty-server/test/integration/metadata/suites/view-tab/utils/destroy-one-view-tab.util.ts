import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyViewTabQueryFactory } from 'test/integration/metadata/suites/view-tab/utils/destroy-view-tab-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type DestroyViewTabInput } from 'src/engine/metadata-modules/view-tab/dtos/inputs/destroy-view-tab.input';
import { type ViewTabEntity } from 'src/engine/metadata-modules/view-tab/entities/view-tab.entity';

export const destroyOneViewTab = async ({
  input,
  gqlFields,
  expectToFail,
}: PerformMetadataQueryParams<DestroyViewTabInput>): CommonResponseBody<{
  destroyViewTab: ViewTabEntity;
}> => {
  const graphqlOperation = destroyViewTabQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataApiRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Tab destruction should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View Tab destruction has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
