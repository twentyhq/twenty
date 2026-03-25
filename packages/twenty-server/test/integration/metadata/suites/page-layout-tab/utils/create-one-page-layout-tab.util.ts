import {
  type CreateOnePageLayoutTabFactoryInput,
  createOnePageLayoutTabQueryFactory,
} from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type PageLayoutTabDTO } from 'src/engine/metadata-modules/page-layout-tab/dtos/page-layout-tab.dto';

export const createOnePageLayoutTab = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<CreateOnePageLayoutTabFactoryInput>): CommonResponseBody<{
  createPageLayoutTab: PageLayoutTabDTO;
}> => {
  const graphqlOperation = createOnePageLayoutTabQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Page layout tab creation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Page layout tab creation has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
