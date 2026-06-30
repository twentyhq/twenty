import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { upsertViewWidgetQueryFactory } from 'test/integration/metadata/suites/view/utils/upsert-view-widget-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type UpsertViewWidgetInput } from 'src/engine/metadata-modules/view/dtos/inputs/upsert-view-widget.input';
import { type ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';

export const upsertViewWidget = async ({
  input,
  gqlFields,
  expectToFail,
}: {
  input: UpsertViewWidgetInput;
  gqlFields?: string;
  expectToFail?: boolean | null;
}): CommonResponseBody<{
  upsertViewWidget: ViewDTO;
}> => {
  const graphqlOperation = upsertViewWidgetQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Upsert view widget should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Upsert view widget has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
