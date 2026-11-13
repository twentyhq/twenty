import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { createManyViewTabsQueryFactory } from 'test/integration/metadata/suites/view-tab/utils/create-many-view-tabs-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type CreateViewTabInput } from 'src/engine/metadata-modules/view-tab/dtos/inputs/create-view-tab.input';
import { type ViewTabEntity } from 'src/engine/metadata-modules/view-tab/entities/view-tab.entity';

export const createManyViewTabs = async ({
  inputs,
  gqlFields,
  expectToFail,
}: {
  inputs: CreateViewTabInput[];
  gqlFields?: string;
  expectToFail?: boolean;
}): CommonResponseBody<{
  createManyViewTabs: ViewTabEntity[];
}> => {
  const graphqlOperation = createManyViewTabsQueryFactory({
    inputs,
    gqlFields,
  });

  const response = await makeMetadataApiRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Tabs batch creation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View Tabs batch creation has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
