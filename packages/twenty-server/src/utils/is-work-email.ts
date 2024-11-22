import { emailProvidersSet } from 'src/utils/email-providers';

export const getDomainNameByEmail = (email: string) => {
  if (!email) {
    throw new Error('Email is required');
  }

  const fields = email.split('@');

  if (fields.length !== 2) {
    throw new Error('Invalid email format');
  }

  const domain = fields[1];

  if (!domain) {
    throw new Error('Invalid email format');
  }

  return domain;
};

export const isWorkEmail = (email: string) => {
  try {
    return !emailProvidersSet.has(getDomainNameByEmail(email));
  } catch (err) {
    return false;
  }
};
