import { msg } from '@lingui/core/macro';

import {
  InvalidMetadataException,
  InvalidMetadataExceptionCode,
} from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

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
  'job',
  'jobs',
  'keyValuePair',
  'keyValuePairs',
  'pageLayout',
  'pageLayouts',
  'pageLayoutTab',
  'pageLayoutTabs',
  'pageLayoutWidget',
  'pageLayoutWidgets',
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

export const RESERVED_METADATA_NAME_KEYWORDS = [
  ...coreObjectNames,
  'plan',
  'plans',
  'event',
  'events',
  'field',
  'fields',
  'link',
  'links',
  'currency',
  'currencies',
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
  'aggregate',
];

export const validateMetadataNameIsNotReservedKeywordOrThrow = (
  name: string,
) => {
  if (RESERVED_METADATA_NAME_KEYWORDS.includes(name)) {
    throw new InvalidMetadataException(
      `The name "${name}" is not available`,
      InvalidMetadataExceptionCode.RESERVED_KEYWORD,
      {
        userFriendlyMessage: msg`This name is not available.`,
      },
    );
  }
};
