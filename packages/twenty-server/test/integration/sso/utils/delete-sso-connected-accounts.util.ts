import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { findMyConnectedAccounts } from 'test/integration/metadata/suites/connected-account/utils/find-my-connected-accounts.util';
import { SSO_TEST_PROTOCOLS } from 'test/integration/sso/constants/sso-test-protocols.constant';

export const deleteSsoConnectedAccounts = async ({
  token,
}: {
  token: string;
}) => {
  const ssoConnectedAccounts = (
    await findMyConnectedAccounts({ token })
  ).filter(({ provider }) =>
    SSO_TEST_PROTOCOLS.some(
      ({ connectedAccountProvider }) => connectedAccountProvider === provider,
    ),
  );

  for (const { id } of ssoConnectedAccounts) {
    await deleteConnectedAccount({ id, expectToFail: false, token });
  }
};
