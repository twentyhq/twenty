export const getDomainFromEmail = (email: string): string | undefined => {
  const lastAtIndex = email.lastIndexOf('@');

  if (lastAtIndex === -1) {
    return undefined;
  }

  return email.slice(lastAtIndex + 1);
};
