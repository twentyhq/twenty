export const getWorkspaceSubdomainByOrigin = (
  origin: string,
  frontBaseUrl: string,
) => {
  const { hostname } = new URL(origin);

  const hostParts = hostname.split('.');

  if (hostParts.length <= 2) return;

  const subdomain = hostParts[0];

  if (hostname === new URL(frontBaseUrl).hostname) return;

  return subdomain;
};
