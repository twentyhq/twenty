import { InvalidMetadataNameException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata-name.exception';

const coreObjectNames = [
  'approvedAccessDomain',
  'approvedAccessDomains',
  'appToken',
  'appTokens',
  'billingCustomer',
  'billingCustomers',
  'billingEntitlement',
  'billingEntitlements',
  'billingMeter',
  'billingMeters',
  'billingProduct',
  'billingProducts',
  'billingSubscription',
  'billingSubscriptions',
  'billingSubscriptionItem',
  'billingSubscriptionItems',
  'featureFlag',
  'featureFlags',
  'keyValuePair',
  'keyValuePairs',
  'postgresCredential',
  'postgresCredentials',
  'twoFactorMethod',
  'twoFactorMethods',
  'user',
  'users',
  'userWorkspace',
  'userWorkspaces',
  'workspace',
  'workspaces',
  'role',
  'roles',
  'userWorkspaceRole',
  'userWorkspaceRoles',
];

const reservedKeywords = [
  ...coreObjectNames,
  'event',
  'events',
  'field',
  'fields',
  'link',
  'links',
  'currency',
  'currencies',
  'fullName',
  'fullNames',
  'address',
  'addresses',
  'type',
  'types',
  'object',
  'objects',
  'index',
  'relation',
  'relations',
];

export const validateMetadataNameIsNotReservedKeywordOrThrow = (
  name: string,
) => {
  if (reservedKeywords.includes(name)) {
    throw new InvalidMetadataNameException(
      `The name "${name}" is not available`,
    );
  }
};
