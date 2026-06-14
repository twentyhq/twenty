'use client';

import type { ReactNode } from 'react';

import { useUnlocalizedPathname } from '@/lib/i18n';

type FooterVisibilityGateProps = {
  children: ReactNode;
};

export function FooterVisibilityGate({ children }: FooterVisibilityGateProps) {
  const route = useUnlocalizedPathname();

  if (route === '/halftone' || route === '/partners/apply') {
    return null;
  }

  return <>{children}</>;
}
