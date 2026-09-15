import { type ReactNode } from 'react';

import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { MenuStyleProvider } from '@/platform/menu-style';
import { Footer } from '@/sections/footer';

const SiteLayout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<LocaleRouteParams>;
}) => {
  await getRouteI18n(params);

  return (
    <MenuStyleProvider>
      {children}
      <Footer />
    </MenuStyleProvider>
  );
};

export default SiteLayout;
