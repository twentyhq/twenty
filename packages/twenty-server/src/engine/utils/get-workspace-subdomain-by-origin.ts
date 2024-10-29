export const getWorkspaceSubdomainByOrigin = (origin: string) => {
  const { hostname } = new URL(origin);

  const hostParts = hostname.split('.');

  if (hostParts.length <= 2) return;

  const subdomain = hostParts[0];

  if (subdomain === 'app') return;

  return subdomain;
};
