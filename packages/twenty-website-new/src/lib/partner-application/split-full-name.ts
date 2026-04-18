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
