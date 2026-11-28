import { PAGE_PREVIEWS } from './page-previews';

// The URL and params a route renders with: a dynamic route takes its first
// static param, and has no preview when it declares none.
export const resolvePagePreview = async (route: string) => {
  const entry = PAGE_PREVIEWS.pages[route];
  if (!entry) return null;
  if (!route.includes('[')) return { url: route, params: {} };
  const first = (await entry.staticParams?.())?.[0];
  if (!first) return null;
  return {
    url: route.replace(/\[(\w+)\]/g, (_, key: string) => first[key] ?? ''),
    params: first,
  };
};
