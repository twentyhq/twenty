import {
  type UpdateNavigationMenuItemFactoryInput,
  updateNavigationMenuItemQueryFactory,
} from 'test/integration/metadata/suites/navigation-menu-item/utils/update-navigation-menu-item-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type NavigationMenuItemDTO } from 'src/engine/metadata-modules/navigation-menu-item/dtos/navigation-menu-item.dto';

export const updateNavigationMenuItem = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<UpdateNavigationMenuItemFactoryInput>): CommonResponseBody<{
  updateNavigationMenuItem: NavigationMenuItemDTO;
}> => {
  const graphqlOperation = updateNavigationMenuItemQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'NavigationMenuItem update should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'NavigationMenuItem update has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
