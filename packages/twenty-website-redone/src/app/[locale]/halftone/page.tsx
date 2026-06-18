import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { buildRouteMetadata } from '@/platform/seo';
import { HalftoneStudioMount } from '@/platform/visuals/halftone-studio/studio/halftone-studio-mount';

export const generateMetadata = buildRouteMetadata('halftone');

// Internal dev tool: noindex via the route registry record. The studio mounts
// client-only behind a dynamic(ssr:false) boundary, so three never enters any
// initial chunk.
export default async function HalftonePage({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}) {
  await getRouteI18n(params);

  return <HalftoneStudioMount />;
}
