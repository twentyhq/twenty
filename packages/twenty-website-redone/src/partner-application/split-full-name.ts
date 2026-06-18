// The form collects one "name" field; the webhook payload wants first/last.
// First token is the first name, the rest join as the last name.
export function splitFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const tokens = fullName.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return { firstName: '', lastName: '' };
  }
  const [firstName, ...rest] = tokens;
  return { firstName, lastName: rest.join(' ') };
}
