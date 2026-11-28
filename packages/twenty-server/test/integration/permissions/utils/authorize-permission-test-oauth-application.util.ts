import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { loginAsTwentyCli } from 'test/integration/metadata/suites/application/utils/login-as-twenty-cli.util';

import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

export const authorizePermissionTestOauthApplicationOrThrow = async ({
  accessToken,
}: {
  accessToken: string;
}) => {
  await loginAsTwentyCli(accessToken);

  const { data } = await findOneApplication({
    input: {
      universalIdentifier:
        TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
    },
    gqlFields: 'id',
    expectToFail: false,
    token: accessToken,
  });

  return data.findOneApplication.id;
};
