import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { createManyCoreViewFieldsQueryFactory } from 'test/integration/metadata/suites/view-field/utils/create-many-core-view-fields-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';
import { type ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';

export const createManyCoreViewFields = async ({
  inputs,
  gqlFields,
  expectToFail,
}: {
  inputs: CreateViewFieldInput[];
  gqlFields?: string;
  expectToFail?: boolean;
}): CommonResponseBody<{
  createManyCoreViewFields: ViewFieldEntity[];
}> => {
  const graphqlOperation = createManyCoreViewFieldsQueryFactory({
    inputs,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Fields batch creation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View Fields batch creation has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
