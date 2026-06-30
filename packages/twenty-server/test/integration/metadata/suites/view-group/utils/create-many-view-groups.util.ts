import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { createManyViewGroupsQueryFactory } from 'test/integration/metadata/suites/view-group/utils/create-many-view-groups-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type CreateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/create-view-group.input';
import { type ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';

export const createManyViewGroups = async ({
  inputs,
  gqlFields,
  expectToFail,
}: {
  inputs: CreateViewGroupInput[];
  gqlFields?: string;
  expectToFail?: boolean;
}): CommonResponseBody<{
  createManyViewGroups: ViewGroupEntity[];
}> => {
  const graphqlOperation = createManyViewGroupsQueryFactory({
    inputs,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Groups batch creation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View Groups batch creation has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
