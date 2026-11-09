import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { findMyConnectedAccounts } from 'test/integration/metadata/suites/connected-account/utils/find-my-connected-accounts.util';
import { SSO_TEST_PROTOCOLS } from 'test/integration/sso/constants/sso-test-protocols.constant';

export const deleteSsoUser = async ({
  accessToken,
  email,
}: {
  accessToken: string;
  email: string;
}) => {
  // deleteUser hands the departing member's connected accounts to another member
  const ssoConnectedAccounts = (
    await findMyConnectedAccounts({ token: accessToken })
  ).filter(
    ({ provider, handle }) =>
      handle === email &&
      SSO_TEST_PROTOCOLS.some(
        ({ connectedAccountProvider }) => connectedAccountProvider === provider,
      ),
  );

  for (const { id } of ssoConnectedAccounts) {
    await deleteConnectedAccount({
      id,
      expectToFail: false,
      token: accessToken,
    });
  }

  await deleteUser({ accessToken, expectToFail: false });
};
