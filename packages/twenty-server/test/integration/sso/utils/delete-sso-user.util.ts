import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { deleteSsoConnectedAccounts } from 'test/integration/sso/utils/delete-sso-connected-accounts.util';

export const deleteSsoUser = async ({
  accessToken,
}: {
  accessToken: string;
}) => {
  // deleteUser hands the departing member's connected accounts to another member
  await deleteSsoConnectedAccounts({ token: accessToken });

  await deleteUser({ accessToken, expectToFail: false });
};
