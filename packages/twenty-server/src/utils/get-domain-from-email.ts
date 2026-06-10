// The domain of an email address: everything after the last '@'. Splitting on
// the last '@' (not the first) matters because a quoted local part may itself
// contain one — the domain of "a@b"@example.com is example.com. Returns
// undefined when the address has no '@', and preserves the original case.
export const getDomainFromEmail = (email: string): string | undefined => {
  const lastAtIndex = email.lastIndexOf('@');

  if (lastAtIndex === -1) {
    return undefined;
  }

  return email.slice(lastAtIndex + 1);
};
