// Workspace-selection origin for a seeded workspace, passed as the GraphQL
// `origin` variable on auth exchanges. The server resolves which workspace to
// authenticate into from this URL's subdomain
// (getWorkspaceByOriginOrDefaultWorkspace); it is routing data, unrelated to
// the HTTP Origin header the CSRF and cookie-issuance gates read.
export const buildWorkspaceOriginForSubdomain = (subdomain: string): string => {
  const origin = new URL(`http://localhost:${APP_PORT}`);

  origin.hostname =
    process.env.IS_MULTIWORKSPACE_ENABLED === 'true'
      ? `${subdomain}.${origin.hostname}`
      : origin.hostname;

  return origin.toString();
};

export const buildAppleWorkspaceOrigin = (): string =>
  buildWorkspaceOriginForSubdomain('apple');
