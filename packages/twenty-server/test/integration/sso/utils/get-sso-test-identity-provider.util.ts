import { isNonEmptyString } from '@sniptt/guards';
import { SSO_TEST_ENVIRONMENT_VARIABLE_NAMES } from 'test/integration/sso/constants/sso-test-environment-variable-names.constant';

const getRequiredEnvironmentVariable = (name: string) => {
  const value = process.env[name];

  if (!isNonEmptyString(value)) {
    throw new Error(`${name} is required to run the SSO suite`);
  }

  return value;
};

export const isSsoTestIdentityProviderConfigured = () =>
  Object.values(SSO_TEST_ENVIRONMENT_VARIABLE_NAMES).every((name) =>
    isNonEmptyString(process.env[name]),
  );

export const getSsoTestIdentityProvider = () => ({
  issuer: getRequiredEnvironmentVariable(
    SSO_TEST_ENVIRONMENT_VARIABLE_NAMES.issuer,
  ),
  clientId: getRequiredEnvironmentVariable(
    SSO_TEST_ENVIRONMENT_VARIABLE_NAMES.clientId,
  ),
  clientSecret: getRequiredEnvironmentVariable(
    SSO_TEST_ENVIRONMENT_VARIABLE_NAMES.clientSecret,
  ),
  member: {
    username: getRequiredEnvironmentVariable(
      SSO_TEST_ENVIRONMENT_VARIABLE_NAMES.memberUsername,
    ),
    password: getRequiredEnvironmentVariable(
      SSO_TEST_ENVIRONMENT_VARIABLE_NAMES.memberPassword,
    ),
  },
  nonMember: {
    username: getRequiredEnvironmentVariable(
      SSO_TEST_ENVIRONMENT_VARIABLE_NAMES.nonMemberUsername,
    ),
    password: getRequiredEnvironmentVariable(
      SSO_TEST_ENVIRONMENT_VARIABLE_NAMES.nonMemberPassword,
    ),
  },
});
