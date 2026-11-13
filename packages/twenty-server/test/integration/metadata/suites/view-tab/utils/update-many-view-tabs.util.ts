import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateManyViewTabsQueryFactory } from 'test/integration/metadata/suites/view-tab/utils/update-many-view-tabs-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type UpdateViewTabInput } from 'src/engine/metadata-modules/view-tab/dtos/inputs/update-view-tab.input';
import { type ViewTabEntity } from 'src/engine/metadata-modules/view-tab/entities/view-tab.entity';

export const updateManyViewTabs = async ({
  inputs,
  gqlFields,
  expectToFail,
}: {
  inputs: UpdateViewTabInput[];
  gqlFields?: string;
  expectToFail?: boolean;
}): CommonResponseBody<{
  updateManyViewTabs: ViewTabEntity[];
}> => {
  const graphqlOperation = updateManyViewTabsQueryFactory({
    inputs,
    gqlFields,
  });

  const response = await makeMetadataApiRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Tabs batch update should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View Tabs batch update has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
