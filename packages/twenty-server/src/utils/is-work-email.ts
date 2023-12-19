import { emailProvidersSet } from 'src/utils/email-providers';

export const isWorkEmail = (email: string) => {
  if (!email) {
    return false;
  }

  const fields = email.split('@');

  if (fields.length !== 2) {
    return false;
  }

  const domain = fields[1];

  if (!domain) {
    return false;
  }

  return !emailProvidersSet.has(domain);
};
