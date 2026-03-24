import { updateManyNavigationMenuItemsQueryFactory } from 'test/integration/metadata/suites/navigation-menu-item/utils/update-many-navigation-menu-items-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type NavigationMenuItemDTO } from 'src/engine/metadata-modules/navigation-menu-item/dtos/navigation-menu-item.dto';
import { type UpdateOneNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/update-navigation-menu-item.input';

export const updateManyNavigationMenuItems = async ({
  inputs,
  gqlFields,
  expectToFail = false,
  token,
}: {
  inputs: UpdateOneNavigationMenuItemInput[];
  gqlFields?: string;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  updateManyNavigationMenuItems: NavigationMenuItemDTO[];
}> => {
  const graphqlOperation = updateManyNavigationMenuItemsQueryFactory({
    inputs,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'NavigationMenuItems batch update should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'NavigationMenuItems batch update has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
