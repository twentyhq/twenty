import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { loginAsTwentyCli } from 'test/integration/metadata/suites/application/utils/login-as-twenty-cli.util';
import { isDefined } from 'twenty-shared/utils';

export const createOauthOnlyApplication = async ({
  accessToken,
}: {
  accessToken: string;
}) => {
  await loginAsTwentyCli(accessToken);

  const { data } = await findManyApplications({
    gqlFields: 'id defaultRoleId',
    expectToFail: false,
    accessToken,
  });

  return data.findManyApplications.find(
    ({ defaultRoleId }) => !isDefined(defaultRoleId),
  )?.id as string;
};
