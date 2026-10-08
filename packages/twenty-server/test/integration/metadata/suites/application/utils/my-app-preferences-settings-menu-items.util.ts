import {
  type MyAppPreferencesSettingsMenuItemsInput,
  myAppPreferencesSettingsMenuItemsQueryFactory,
} from 'test/integration/metadata/suites/application/utils/my-app-preferences-settings-menu-items-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type AppPreferencesSettingsMenuItemDTO } from 'src/engine/core-modules/application/application-variable/dtos/app-preferences-settings-menu-item.dto';

export const myAppPreferencesSettingsMenuItems = async ({
  input,
  gqlFields,
  token,
  expectToFail = false,
}: PerformMetadataQueryParams<MyAppPreferencesSettingsMenuItemsInput>): CommonResponseBody<{
  myAppPreferencesSettingsMenuItems: AppPreferencesSettingsMenuItemDTO[];
}> => {
  const response = await makeMetadataApiRequest(
    myAppPreferencesSettingsMenuItemsQueryFactory({ input, gqlFields }),
    token,
  );

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Reading personal settings menu items should have failed',
    });
  } else {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Reading personal settings menu items should have succeeded',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
