import { PAGE_PREVIEWS } from './page-previews';

// The page component itself, inside the (site) layout, as the site serves it.
export function PagePreview({
  route,
  locale,
  params,
}: {
  route: string;
  locale: string;
  params: Record<string, string>;
}) {
  const entry = PAGE_PREVIEWS.pages[route];
  if (!entry) return null;
  const { Page } = entry;
  const Layout = PAGE_PREVIEWS.layout;
  const routeParams = Promise.resolve({ locale, ...params });
  const page = <Page params={routeParams} />;
  return Layout ? <Layout params={routeParams}>{page}</Layout> : page;
}
