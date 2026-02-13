import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const getDomainNameByEmail = (email: string) => {
  if (!isNonEmptyString(email)) {
    throw new UserInputError(
      'Email is required. Please provide a valid email address.',
      {
        userFriendlyMessage: msg`Email is required. Please provide a valid email address.`,
      },
    );
  }

  const fields = email.split('@');

  if (fields.length !== 2) {
    throw new UserInputError(
      'The provided email address is not valid. Please use a standard email format (e.g., user@example.com).',
      {
        userFriendlyMessage: msg`The provided email address is not valid. Please use a standard email format (e.g., user@example.com).`,
      },
    );
  }

  const domain = fields[1];

  if (!domain) {
    throw new UserInputError(
      'The provided email address is missing a domain. Please use a standard email format (e.g., user@example.com).',
      {
        userFriendlyMessage: msg`The provided email address is missing a domain. Please use a standard email format (e.g., user@example.com).`,
      },
    );
  }

  return domain;
};
