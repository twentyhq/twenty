'use client';

import { HeaderDesktop } from '@/app/_components/ui/layout/header/HeaderDesktop';
import { HeaderMobile } from '@/app/_components/ui/layout/header/HeaderMobile';

export const AppHeader = () => {
  return (
    <>
      <HeaderDesktop />
      <HeaderMobile />
    </>
  );
};
