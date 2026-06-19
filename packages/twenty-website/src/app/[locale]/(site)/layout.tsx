import { type ReactNode } from 'react';

import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { Footer } from '@/sections/footer';

// The site-chrome layout. Marketing pages live under (site) and get the shared
// footer here; focused pages (the application form) live in (focused) with no
// chrome. The footer is config-less shared chrome, so it belongs in a layout —
// the route structure decides who shows it, not a runtime visibility gate. The
// Menu stays per-page because its scheme varies per page (and product's is
// scroll-synced), so it can't be hoisted here without a flash.
//
// The footer reads i18n (getServerI18n), so this layout establishes the
// request-scoped i18n context the same way every [locale] route segment does:
// the segment that renders i18n content owns its getRouteI18n call.
const SiteLayout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<LocaleRouteParams>;
}) => {
  await getRouteI18n(params);

  return (
    <>
      {children}
      <Footer />
    </>
  );
};

export default SiteLayout;
