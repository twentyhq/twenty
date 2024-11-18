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

  url.hostname = subdomain ? `${subdomain}.${url.hostname}` : url.hostname;

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
