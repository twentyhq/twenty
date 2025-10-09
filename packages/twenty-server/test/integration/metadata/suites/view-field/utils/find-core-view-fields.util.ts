import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { findCoreViewFieldsQueryFactory } from 'test/integration/metadata/suites/view-field/utils/find-core-view-fields-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';

export const findCoreViewFields = async ({
  viewId,
  gqlFields,
  expectToFail,
}: {
  viewId: string;
  gqlFields?: string;
  expectToFail?: boolean;
}): CommonResponseBody<{
  getCoreViewFields: ViewFieldEntity[];
}> => {
  const graphqlOperation = findCoreViewFieldsQueryFactory({
    viewId,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Field search should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View Field search has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
