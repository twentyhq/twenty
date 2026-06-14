import { type ReactNode } from 'react';

import { Footer } from '@/sections/footer';

// The site-chrome layout. Marketing pages live under (site) and get the shared
// footer here; focused pages (the application form) live in (focused) with no
// chrome. The footer is config-less shared chrome, so it belongs in a layout —
// the route structure decides who shows it, not a runtime visibility gate. The
// Menu stays per-page because its scheme varies per page (and product's is
// scroll-synced), so it can't be hoisted here without a flash.
const SiteLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {children}
      <Footer />
    </>
  );
};

export default SiteLayout;
