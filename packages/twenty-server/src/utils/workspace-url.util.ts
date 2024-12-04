import { isDefined } from 'src/utils/is-defined';

export const buildWorkspaceURL = (
  baseUrl: string,
  subdomain: string | null,
  {
    withPathname,
    withSearchParams,
  }: {
    withPathname?: string;
    withSearchParams?: Record<string, string | number>;
  } = {},
) => {
  const url = new URL(baseUrl);

  if (subdomain && subdomain.length > 0) {
    url.hostname = subdomain + '.' + url.hostname;
  }

  if (withPathname) {
    url.pathname = withPathname;
  }

  if (withSearchParams) {
    Object.entries(withSearchParams).forEach(([key, value]) => {
      if (isDefined(value)) {
        url.searchParams.set(key, value.toString());
      }
    });
  }

  return url;
};
