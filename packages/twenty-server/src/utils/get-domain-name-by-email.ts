import { isNonEmptyString } from '@sniptt/guards';

export const getDomainNameByEmail = (email: string) => {
  if (!isNonEmptyString(email)) {
    throw new Error('Email is required');
  }

  const fields = email.split('@');

  if (fields.length !== 2) {
    throw new Error(`Invalid email format (${fields.length - 1} @) ${email}`);
  }

  const domain = fields[1];

  if (!domain) {
    throw new Error(`Invalid email format (no domain) ${email}`);
  }

  return domain;
};
