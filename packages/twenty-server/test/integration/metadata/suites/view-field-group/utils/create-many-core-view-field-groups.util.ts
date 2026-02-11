import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { createManyCoreViewFieldGroupsQueryFactory } from 'test/integration/metadata/suites/view-field-group/utils/create-many-core-view-field-groups-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type CreateViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/create-view-field-group.input';
import { type ViewFieldGroupDTO } from 'src/engine/metadata-modules/view-field-group/dtos/view-field-group.dto';

export const createManyCoreViewFieldGroups = async ({
  inputs,
  gqlFields,
  expectToFail,
}: {
  inputs: CreateViewFieldGroupInput[];
  gqlFields?: string;
  expectToFail?: boolean;
}): CommonResponseBody<{
  createManyCoreViewFieldGroups: ViewFieldGroupDTO[];
}> => {
  const graphqlOperation = createManyCoreViewFieldGroupsQueryFactory({
    inputs,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'View Field Groups batch creation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'View Field Groups batch creation has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
