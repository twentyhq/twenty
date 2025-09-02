export const isValidDomain = (domain: string) => {
  if (typeof domain !== 'string') return false;

  if (!domain.includes('.')) return false;

  if (domain.includes('*') || domain.endsWith('.')) return false;

  return /^(?:(?:_?[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?|xn--[a-z0-9]+)\.)+(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?|xn--[a-z0-9]+)$/i.test(
    domain,
  );
};
