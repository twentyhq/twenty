import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import {
  CreateOneViewFactoryInput,
  createOneViewQueryFactory,
} from 'test/integration/metadata/suites/view/utils/create-one-view-query-factory.util';
import { CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const createOneView = async ({
  input,
  gqlFields,
  expectToFail = false,
}: PerformMetadataQueryParams<CreateOneViewFactoryInput>): CommonResponseBody<{
  createView: ViewWorkspaceEntity; // not accurate
}> => {
  const graphqlOperation = createOneViewQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View creation should have failed but did not',
    });
  }

  if (response.body.errors) {
    console.log(response.body.errors);
  }
  
  return { data: response.body.data, errors: response.body.errors };
}; 