import { parseEmailFromAddress } from 'src/utils/parse-email-from-address';

// Escape backslash and double-quote per RFC 5322 quoted-string rules
const escapeDisplayName = (displayName: string): string =>
  displayName.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

export const buildEmailFrom = (
  emailFromAddress: string,
  emailFromName: string,
): string => {
  const parsedFromAddress = parseEmailFromAddress(emailFromAddress);
  const displayName = parsedFromAddress.name || emailFromName;

  if (displayName) {
    return `"${escapeDisplayName(displayName)}" <${parsedFromAddress.address}>`;
  }

  return parsedFromAddress.address;
};
