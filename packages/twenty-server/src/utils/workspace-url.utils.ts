import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export const buildWorkspaceURL = (
  baseUrl: string,
  params:
    | {
        workspace: Workspace;
      }
    | { subdomain: string },
  {
    withPathname,
    withSearchParams,
  }: {
    withPathname?: string;
    withSearchParams?: Record<string, string | number>;
  } = {},
) => {
  const subdomain =
    'subdomain' in params
      ? params.subdomain
      : 'workspace' in params
        ? params.workspace.subdomain
        : null;

  if (!subdomain) {
    throw new Error('Subdomain not found');
  }

  const url = new URL(baseUrl);

  url.hostname = `${subdomain}.${url.hostname}`;

  if (withPathname) {
    url.pathname = withPathname;
  }

  if (withSearchParams) {
    Object.entries(withSearchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value.toString());
    });
  }

  return url;
};
