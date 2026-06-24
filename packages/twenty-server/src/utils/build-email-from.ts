import { parseEmailFromAddress } from 'src/utils/parse-email-from-address';

export const buildEmailFrom = (
  emailFromAddress: string,
  emailFromName: string,
): string => {
  const parsedFromAddress = parseEmailFromAddress(emailFromAddress);
  const displayName = parsedFromAddress.name || emailFromName;

  if (displayName) {
    return `"${displayName}" <${parsedFromAddress.address}>`;
  }

  return parsedFromAddress.address;
};
