import { isDefined } from 'twenty-shared/utils';

type CreateIdentityProviderSessionTokenArgs = {
  identityProviderOrigin: string;
  username: string;
  password: string;
};

type AuthnResponse = {
  status?: string;
  sessionToken?: string;
  errorSummary?: string;
};

// Headless login: /api/v1/authn trades the password for a one-time
// sessionToken that stands in for the identity provider's sign-in page
export const createIdentityProviderSessionToken = async ({
  identityProviderOrigin,
  username,
  password,
}: CreateIdentityProviderSessionTokenArgs) => {
  const authnResponse = await fetch(
    new URL('/api/v1/authn', identityProviderOrigin),
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    },
  );

  const authn = (await authnResponse.json()) as AuthnResponse;

  if (authn.status !== 'SUCCESS' || !isDefined(authn.sessionToken)) {
    throw new Error(
      `Identity provider authn did not succeed (HTTP ${authnResponse.status}, status ${authn.status}): ${authn.errorSummary}`,
    );
  }

  return authn.sessionToken;
};
