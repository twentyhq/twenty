import { ViewFilterWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter.workspace-entity';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import {
    CreateOneViewFilterFactoryInput,
    createOneViewFilterQueryFactory,
} from 'test/integration/metadata/suites/view/utils/create-one-view-filter-query-factory.util';
import { CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const createOneViewFilter = async ({
  input,
  gqlFields,
  expectToFail = false,
}: PerformMetadataQueryParams<CreateOneViewFilterFactoryInput>): CommonResponseBody<{
  createViewFilter: ViewFilterWorkspaceEntity; // not accurate
}> => {
  const graphqlOperation = createOneViewFilterQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View Filter creation should have failed but did not',
    });
  }

  if (response.body.errors) {
    console.log(response.body.errors);
  }
  
  return { data: response.body.data, errors: response.body.errors };
}; 