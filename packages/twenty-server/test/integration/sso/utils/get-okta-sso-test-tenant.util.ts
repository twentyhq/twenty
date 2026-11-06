import { isNonEmptyString } from '@sniptt/guards';

const getRequiredEnvironmentVariable = (name: string) => {
  const value = process.env[name];

  if (!isNonEmptyString(value)) {
    throw new Error(
      `${name} is required to run the Okta SSO suite, see test/integration/sso/README.md`,
    );
  }

  return value;
};

export const getOktaSsoTestTenant = () => ({
  issuer: getRequiredEnvironmentVariable('OKTA_SSO_TEST_ISSUER'),
  clientId: getRequiredEnvironmentVariable('OKTA_SSO_TEST_CLIENT_ID'),
  clientSecret: getRequiredEnvironmentVariable('OKTA_SSO_TEST_CLIENT_SECRET'),
  username: getRequiredEnvironmentVariable('OKTA_SSO_TEST_USERNAME'),
  password: getRequiredEnvironmentVariable('OKTA_SSO_TEST_PASSWORD'),
});
